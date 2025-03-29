// Corrected ProtectedRoute.jsx
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axiosInstance from "./utils/axiosInstance";

export const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('ProtectedRoute: Starting auth check...');
        const response = await axiosInstance.get("/auth-check");
        console.log("ProtectedRoute: Auth check response:", response.data);
        
        if (mounted) {
          if (response.data.success) {
            console.log("ProtectedRoute: Setting authenticated to true");
            setIsAuthenticated(true);
          } else {
            console.log("ProtectedRoute: Auth check failed but no error thrown");
            setIsAuthenticated(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("ProtectedRoute: Auth check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      console.log("ProtectedRoute: Cleanup");
    };
  }, [location.pathname]); // Re-run when path changes

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Checking authentication...</p>
        <p className="text-sm text-gray-500">Please wait while we verify your session.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};