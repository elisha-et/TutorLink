import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

export default function ProtectedRoute({ children, needRole }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (needRole && user.role !== needRole) return <Navigate to="/" replace />;

  return children;
}
