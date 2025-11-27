// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TutorProfile from "./pages/TutorProfile";
import HelpRequest from "./pages/HelpRequest";
import BrowseTutors from "./pages/BrowseTutors";
import ProtectedRoute from "./components/ProtectedRoute";
import TutorRequests from "./pages/TutorRequests";
import StudentRequests from "./pages/StudentRequests";

export default function App() {
  const { pathname } = useLocation();
  const hideNavOnHome = false; // set false if you want the nav visible on Home

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {!(hideNavOnHome && pathname === "/") && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseTutors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/tutor/profile"
          element={
            <ProtectedRoute needRole="tutor">
              <TutorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/request"
          element={
            <ProtectedRoute needRole="student">
              <HelpRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/requests"
          element={
            <ProtectedRoute needRole="tutor">
              <TutorRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/requests"
          element={
            <ProtectedRoute needRole="student">
              <StudentRequests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
