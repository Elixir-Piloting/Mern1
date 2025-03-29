import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axiosInstance";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [login, setLogin] = useState(""); // Accepts either email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidInput, setIsValidInput] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    const isValid = login.length > 3 && password.length >= 8;
    setIsValidInput(isValid);
  }, [login, password]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
  
    try {
      const response = await axiosInstance.post(
        `/login`, 
        { login, password },
        { withCredentials: true }
      );
  
      if (response.data.success) {
        toast.success("Login successful! Redirecting...");
        
        // Get the redirect path from location state or default to dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 2000);
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }, [login, password, navigate, location.state]);

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-100 shadow-2xl p-4 justify-center items-center rounded-2xl">
        <h1 className="text-2xl mb-4">Login</h1>

        {/* Username or Email Input */}
        <div className="form-group">
          <label htmlFor="login">Username or Email</label>
          <input
            type="text"
            name="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          {login.length > 0 && login.includes("@") && !emailRegex.test(login) && (
            <p className="text-red-500 text-sm">Invalid email format</p>
          )}
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="relative form-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={`p-2 rounded-md px-3 cursor-pointer ${
            isValidInput
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          disabled={!isValidInput}
        >
          Login
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};
