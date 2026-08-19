import { Outlet } from "react-router-dom";

import "./App.css";

import Toaster from "./components/Toaster";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#211D18] transition-colors">
      <Outlet />
      <Toaster />
    </div>
  );
}

export default App;