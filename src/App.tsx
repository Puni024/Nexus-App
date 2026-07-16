import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFoundPage from "./components/NotFoundPage";
import Loader from "./components/Loader";

import { useAuth } from "./context/AuthContext";
import type { AuthContextType } from "./Types/Filtes";
import { useEffect } from "react";

interface AppRoutesProps {
  auth: AuthContextType;
}

function App() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex items-center justify-center">
        <AppRoutes auth={auth} />
      </div>
    </div>
  );
}

export default App;


function AppRoutes({ auth }: AppRoutesProps) {
useEffect(() => {
    console.log("auth.isAuthenticated", auth.isAuthenticated);
  },[auth]
)

  if(auth.loading) {
    return <Loader />;
  }
  

  return (
    <Routes>

      <Route path="/" element={
          auth.isAuthenticated ? ( <Navigate to="/home" replace /> ) : (<Login /> )
        }
      />

      <Route path="/home" element={
          auth.isAuthenticated ? ( <Home /> ) : ( <Navigate to="/" replace />)
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}