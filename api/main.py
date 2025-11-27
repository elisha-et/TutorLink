# main.py — TutorLink API (volunteer MVP)
# Includes:
# - Auth (register/login/me)
# - SQLite models (users, tutor_profiles, help_requests)
# - Tutor profile upsert + tutor search
# - Help requests: create, list (?status=, ?mine=), update status (PATCH)
# - Root & ping routes

from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from passlib.hash import bcrypt
from jose import jwt, JWTError
import datetime as dt
import json

# ---------------------------
# App & CORS
# ---------------------------
app = FastAPI(title="TutorLink API (MVP)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev-friendly; tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "TutorLink API is up"}

# ---------------------------
# Database (SQLite + SQLAlchemy)
# ---------------------------
engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------
# Models
# ---------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)   # "student" | "tutor"
    name = Column(String, nullable=False)

class TutorProfile(Base):
    __tablename__ = "tutor_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, default="")
    subjects = Column(Text, default="[]")       # JSON-encoded list[str]
    availability = Column(Text, default="[]")   # JSON-encoded list[str]
    user = relationship("User")

class HelpRequest(Base):
    __tablename__ = "help_requests"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, index=True, nullable=False)
    description = Column(Text, default="")
    preferred_times = Column(Text, default="[]")  # JSON-encoded list[str]
    status = Column(String, default="open")       # "open" | "matched" | "closed"

Base.metadata.create_all(bind=engine)

# ---------------------------
# Auth (bcrypt + JWT)
# ---------------------------
SECRET = "dev-secret-change-me"   # TODO: move to env var in production
ALGO = "HS256"

def make_token(user_id: int, role: str) -> str:
    now = dt.datetime.utcnow()
    payload = {"sub": str(user_id), "role": role, "iat": now, "exp": now + dt.timedelta(days=7)}
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        data = jwt.decode(token, SECRET, algorithms=[ALGO])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(int(data["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ---------------------------
# Schemas
# ---------------------------
class RegisterIn(BaseModel):
    email: str
    password: str
    role: str         # "student" or "tutor"
    name: str

class LoginIn(BaseModel):
    email: str
    password: str

class TutorProfileIn(BaseModel):
    bio: str = ""
    subjects: list[str] = []
    availability: list[str] = []

class HelpReqIn(BaseModel):
    subject: str
    description: str = ""
    preferred_times: list[str] = []

class HelpReqUpdate(BaseModel):
    status: str  # "open" | "matched" | "closed"

# ---------------------------
# Auth Endpoints
# ---------------------------
@app.post("/auth/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=body.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if body.role not in ("student", "tutor"):
        raise HTTPException(status_code=400, detail="Role must be 'student' or 'tutor'")
    user = User(
        email=body.email,
        name=body.name,
        role=body.role,
        password_hash=bcrypt.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "token": make_token(user.id, user.role),
        "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name},
    }

@app.post("/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=body.email).first()
    if not user or not bcrypt.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "token": make_token(user.id, user.role),
        "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name},
    }

@app.get("/auth/me")
def me(current: User = Depends(get_current_user)):
    return {"id": current.id, "email": current.email, "role": current.role, "name": current.name}

# ---------------------------
# Tutor Profile Endpoints
# ---------------------------
@app.post("/tutors/profile")
def upsert_profile(
    body: TutorProfileIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "tutor":
        raise HTTPException(status_code=403, detail="Only tutors can edit profile")

    prof = db.query(TutorProfile).filter_by(user_id=current.id).first()
    payload = {
        "bio": body.bio,
        "subjects": json.dumps(body.subjects or []),
        "availability": json.dumps(body.availability or []),
    }
    if prof:
        for k, v in payload.items():
            setattr(prof, k, v)
    else:
        prof = TutorProfile(user_id=current.id, **payload)
        db.add(prof)

    db.commit()
    return {"ok": True}

@app.get("/tutors/search")
def search_tutors(subject: str | None = None, db: Session = Depends(get_db)):
    q = db.query(TutorProfile).join(User)
    results = []
    for p in q.all():
        subs = set(json.loads(p.subjects or "[]"))
        if subject and subject not in subs:
            continue
        results.append(
            {
                "tutor_id": p.user_id,
                "name": p.user.name,
                "bio": p.bio,
                "subjects": sorted(list(subs)),
                # "availability": json.loads(p.availability or "[]"),
            }
        )
    return results

# ---------------------------
# Help Request Endpoints
# ---------------------------
@app.post("/help-requests")
def create_help_request(
    body: HelpReqIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "student":
        raise HTTPException(status_code=403, detail="Only students can post requests")
    hr = HelpRequest(
        student_id=current.id,
        subject=body.subject,
        description=body.description,
        preferred_times=json.dumps(body.preferred_times or []),
        status="open",
    )
    db.add(hr)
    db.commit()
    db.refresh(hr)
    return {"id": hr.id, "status": hr.status}

@app.get("/help-requests")
def list_help_requests(
    status: str | None = Query(None),
    mine: bool = Query(False),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """
    - Tutors: see all requests (optionally filter by ?status=open).
    - Students: by default see only their own; or pass ?mine=true (same effect).
    """
    q = db.query(HelpRequest)
    if status:
        q = q.filter(HelpRequest.status == status)
    # Privacy: students only see their own requests
    if current.role == "student":
        q = q.filter(HelpRequest.student_id == current.id)
    # Explicit mine=true also restricts (harmless for tutors; redundant for students)
    if mine and current.role == "student":
        q = q.filter(HelpRequest.student_id == current.id)

    items = []
    for hr in q.order_by(HelpRequest.id.desc()).all():
        student = db.query(User).get(hr.student_id)
        items.append({
            "id": hr.id,
            "subject": hr.subject,
            "status": hr.status,
            "preferred_times": json.loads(hr.preferred_times or "[]"),
            "student_id": hr.student_id,
            "student_name": student.name if student else None,
        })
    return items

@app.patch("/help-requests/{req_id}")
def update_help_request(
    req_id: int,
    body: HelpReqUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """
    Update status to one of: open | matched | closed.
    - Students can update only their own requests.
    - Tutors can update any request (MVP-simple for accept/decline).
    """
    hr = db.query(HelpRequest).get(req_id)
    if not hr:
        raise HTTPException(status_code=404, detail="Help request not found")

    if body.status not in ("open", "matched", "closed"):
        raise HTTPException(status_code=400, detail="Invalid status")

    if current.role == "student" and hr.student_id != current.id:
        raise HTTPException(status_code=403, detail="You can only update your own requests")

    # If you want stricter rules later, enforce transitions here.
    hr.status = body.status
    db.commit()
    return {"ok": True, "status": hr.status}
