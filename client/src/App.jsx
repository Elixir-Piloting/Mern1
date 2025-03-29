import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} /> {/* Handles unknown routes */}
      </Routes>
    </Router>
  );
};

export default App;
