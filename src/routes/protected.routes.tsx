import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Loader from "../components/Loader";
import NotFoundPage from "../components/NotFoundPage";

import type { Role } from "../Types/Filtes";

interface ProtectedRouteProps {
  roles: Role[];
}

function ProtectedRoute({
  roles,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    loading,
    user,
  } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (!user) {
    return <NotFoundPage />;
  }

  if (!roles.includes(user.role)) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}

export default ProtectedRoute;