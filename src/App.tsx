import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import PendingVerification from "./pages/PendingVerification";

import Overview from "./pages/subpages/Overview";
import Newsletter from "./pages/subpages/Newsletter";
import Users from "./pages/subpages/Users";
import Reports from "./pages/subpages/Reports";
import Settings from "./pages/subpages/Settings";
import Contribution from "./pages/subpages/Contribution";
import Approvals from "./pages/subpages/Approvals";
import Newsletter_Hub from "./pages/subpages/Newsletter_Hub";
import People from "./pages/subpages/People";
import AllFiles from "./pages/subpages/AllFiles";

import Loader from "./components/Loader";
import NotFoundPage from "./components/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Toaster from "./components/Toaster";

import { useAuth } from "./context/AuthContext";
import { adminRoutes, homeRoutes } from "./config/routes";
import { getRoutesForSection, getDefaultPathForRole } from "./config/helper";
import type { AppRoute, Section } from "./Types/Filtes";

const pageComponents = {
  AllFiles,
  People,
  Newsletter_Hub,
  Approvals,
  Contribution,
  Overview,
  Newsletter,
  Users,
  Reports,
  Settings,
} as const;

function renderSectionRoutes(routes: AppRoute[], section: Section) {
  return routes.map((route) => {
    const Component = pageComponents[route.component as keyof typeof pageComponents];

    return (
      <Route
        key={`${section}-${route.path}`}
        path={route.path}
        element={
          <ProtectedRoute roles={route.roles}>
            <Component />
          </ProtectedRoute>
        }
      />
    );
  });
}

function IndexRedirect({ section }: { section: Section }) {
  const { user } = useAuth();
  if (!user) return <NotFoundPage />;

  const routes = getRoutesForSection(section, user.role);
  return routes.length
    ? <Navigate to={routes[0].path} replace />
    : <NotFoundPage />;
}

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <Loader />;
  }

  // Only "user" role is gated by verification; admin never is.
  const isPendingUser = !!user && user.role === "user" && user.isVerified === false;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#211D18] transition-colors">
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            isAuthenticated && user
              ? isPendingUser
                ? <Navigate to="/pending-verification" replace />
                : <Navigate to={getDefaultPathForRole(user.role)} replace />
              : <Login />
          }
        />

        {/* Pending verification page */}
        <Route
          path="/pending-verification"
          element={
            !isAuthenticated
              ? <Navigate to="/" replace />
              : isPendingUser
                ? <PendingVerification />
                : <Navigate to={getDefaultPathForRole(user!.role)} replace />
          }
        />

        {/* Admin section -> <Admin /> layout (no verification gate) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<IndexRedirect section="admin" />} />
          {renderSectionRoutes(adminRoutes, "admin")}
        </Route>

        {/* Home (user) section -> <Home /> layout, gated by verification */}
        <Route
          path="/home"
          element={
            <ProtectedRoute roles={["user"]}>
              {isPendingUser
                ? <Navigate to="/pending-verification" replace />
                : <Home />}
            </ProtectedRoute>
          }
        >
          <Route index element={<IndexRedirect section="home" />} />
          {renderSectionRoutes(homeRoutes, "home")}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;