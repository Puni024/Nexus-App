import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from "./context/AuthContext.tsx";


const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {/* <StrictMode> */}
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
    {/* </StrictMode> */}
  </QueryClientProvider>
);