import { Navigate } from "react-router-dom";
import {Loader} from "./Loader";
import { useAuth } from "../common/auth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: Props) {

  const { data, isLoading, isError } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}