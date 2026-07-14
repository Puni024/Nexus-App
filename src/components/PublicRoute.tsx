import { Navigate } from "react-router-dom";
import { useAuth } from "../common/auth";
import { Loader } from "./Loader";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {

  const { data, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

   if (data) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}