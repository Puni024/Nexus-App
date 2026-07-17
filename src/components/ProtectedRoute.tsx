import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { Role } from "../Types/Filtes";

interface ProtectedRouteProps {
    roles: Role[];
    children: React.ReactNode;
}

export default function ProtectedRoute({
    roles,
    children,
}: ProtectedRouteProps) {

    const { loading, isAuthenticated, user } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!user || !roles.includes(user.role)) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}