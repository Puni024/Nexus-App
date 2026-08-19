import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext.tsx";

import "./index.css";

const queryClient = new QueryClient();

createRoot(
  document.getElementById("root")!
).render(
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider
      clientId={
        import.meta.env.VITE_GOOGLE_CLIENT_ID
      }
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);