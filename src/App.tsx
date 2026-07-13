import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";


function App() {
  
  const [valid, setValid] = useState<boolean>(false);

  return (
  <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Login  />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;