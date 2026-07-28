import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../context/AuthContext";
import NotFoundPage from "./NotFoundPage";
import Loader from "./Loader";
import type { Role } from "../Types/Filtes";

interface ProtectedRouteProps {
  children: ReactNode;
  roles: Role[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

   if (!user || !roles.includes(user.role)) {
    return <NotFoundPage />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;