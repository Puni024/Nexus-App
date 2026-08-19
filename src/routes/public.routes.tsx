import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { getDefaultPathForRole } from "../config/helper";

function PublicRoute() {
  const {
    isAuthenticated,
    loading,
    user,
  } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated || !user) {
    return <Outlet />;
  }

  const isPendingUser =
    user.role === "user" &&
    user.isVerified === false;

  if (isPendingUser) {
    return (
      <Navigate
        to="/pending-verification"
        replace
      />
    );
  }

  return (
    <Navigate
      to={getDefaultPathForRole(user.role)}
      replace
    />
  );
}

export default PublicRoute;