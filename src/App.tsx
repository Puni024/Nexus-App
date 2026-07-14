import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import  NotFoundPage  from "./components/NotFoundPage";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";


function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex items-center justify-center">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
            <Login />
          </PublicRoute>
      } />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}