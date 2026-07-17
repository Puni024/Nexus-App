import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";

import Overview from "./pages/subpages/Overview";
import Application from "./pages/subpages/Application";
import Users from "./pages/subpages/Users";
import Reports from "./pages/subpages/Reports";
import Settings from "./pages/subpages/Settings";

import Loader from "./components/Loader";
import NotFoundPage from "./components/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";
import { menuList } from "./config/helper";

function App() {
    const { loading, isAuthenticated, user } = useAuth();

    if (loading) {
        return <Loader />;
    }

    const pageComponents = {
        Overview,
        Application,
        Users,
        Reports,
        Settings,
    } as const;

    // Routes available for the current user
    const routes = menuList(user?.role ?? "user");

    return (
        <div className="min-h-screen bg-gray-100">
            <Routes>

                {/* Login */}
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <Navigate to="/home" replace />
                            : <Login />
                    }
                />

                {/* Home Layout */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute roles={["admin", "user"]}>
                            <Home />
                        </ProtectedRoute>
                    }
                >

                    {/* Default page */}
                    <Route
                        index
                        element={
                            <Navigate
                                to={routes[0].path}
                                replace
                            />
                        }
                    />

                    {/* Dynamic pages */}
                    {routes.map((route) => {
                        const Component =
                            pageComponents[
                                route.component as keyof typeof pageComponents
                            ];

                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={
                                    <ProtectedRoute roles={route.roles}>
                                        <Component />
                                    </ProtectedRoute>
                                }
                            />
                        );
                    })}

                </Route>

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />

            </Routes>
        </div>
    );
}

export default App;