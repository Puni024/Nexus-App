import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "../App";

import Login from "../pages/Login";
import PendingVerification from "../pages/PendingVerification";

import Admin from "../pages/Admin";
import Home from "../pages/Home";

import Overview from "../pages/subpages/Overview";
import People from "../pages/subpages/People";
import AllFiles from "../pages/subpages/AllFiles";
import Newsletter_Hub from "../pages/subpages/Newsletter_Hub";
import Users from "../pages/subpages/Users";
import Approvals from "../pages/subpages/Approvals";
import Settings from "../pages/subpages/Settings";

import Newsletter from "../pages/subpages/Newsletter";
import Contribution from "../pages/subpages/Contribution";

import PublicRoute from "./public.routes";
import ProtectedRoute from "./protected.routes";

import NotFoundPage from "../components/NotFoundPage";

import { useAuth } from "../context/AuthContext";
import { getDefaultPathForRole } from "../config/helper";

function PendingVerificationRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const isPendingUser =
    user.role === "user" &&
    user.isVerified === false;

  if (!isPendingUser) {
    return (
      <Navigate
        to={getDefaultPathForRole(user.role)}
        replace
      />
    );
  }

  return <PendingVerification />;
}

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/",
            element: <Login />,
          },
        ],
      },

      {
        path: "/pending-verification",
        element: <PendingVerificationRoute />,
      },

      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <Admin />,
            children: [
              {
                index: true,
                element: (
                  <Navigate
                    to="overview"
                    replace
                  />
                ),
              },
              {
                path: "overview",
                element: <Overview />,
              },
              {
                path: "people",
                element: <People />,
              },
              {
                path: "all-files",
                element: <AllFiles />,
              },
              {
                path: "newsletterhub",
                element: <Newsletter_Hub />,
              },
              {
                path: "users",
                element: <Users />,
              },
              {
                path: "approvals",
                element: <Approvals />,
              },
              {
                path: "settings",
                element: <Settings />,
              },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute roles={["user"]} />,
        children: [
          {
            path: "/home",
            element: <Home />,
            children: [
              {
                index: true,
                element: (
                  <Navigate
                    to="newsletter"
                    replace
                  />
                ),
              },
              {
                path: "newsletter",
                element: <Newsletter />,
              },
              {
                path: "contribution",
                element: <Contribution />,
              },
              {
                path: "settings",
                element: <Settings />,
              },
            ],
          },
        ],
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);