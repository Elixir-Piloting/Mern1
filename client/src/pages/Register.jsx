import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";


import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const Register = () => {

  const PROXY = "http://localhost:3000";
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isValidInput, setIsValidInput] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Recalculate validation dynamically
  useEffect(() => {
    const isUserNameValid = userName.length >= 3;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = passwordRegex.test(password);
    const isRepeatPasswordValid = password === repeatPassword;

    setIsValidInput(isUserNameValid && isEmailValid && isPasswordValid && isRepeatPasswordValid);
  }, [userName, email, password, repeatPassword]);


const handleSubmit = async (event) => {
  event.preventDefault(); // Prevents default form submission if used inside <form>

  const data = { username: userName, email, password };

  try {
    const response = await axios.post(`${PROXY}/register`, data);
    
    if (response.data.success) {
      toast.success("Registration successful! Redirecting...");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      toast.error(data.message || "Registration failed");
    }

  } catch (error) {
    // Handle error
    toast.error(error.response?.data?.message || "Something went wrong");
  }
};


  return (
    <div className="h-screen w-full flex justify-center items-center">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-100 shadow-2xl p-4 justify-center items-center rounded-2xl">
        <h1 className="text-2xl mb-4">Register</h1>

        {/* Username Field */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            name="username"
          />
          {userName.length > 0 && userName.length < 3 && (
            <p className="text-red-500 text-sm">Must be at least 3 characters</p>
          )}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email.length > 0 && !emailRegex.test(email) && (
            <p className="text-red-500 text-sm">Invalid email format</p>
          )}
        </div>

        {/* Password Field */}
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
          {password.length > 0 && !passwordRegex.test(password) && (
            <p className="text-red-500 text-sm">
              Min 8 chars, 1 uppercase, 1 number, 1 special char
            </p>
          )}
        </div>

        {/* Repeat Password Field */}
        <div className="form-group">
          <label htmlFor="repeatPassword">Confirm Password</label>
          <div className="relative form-group">
            <input
              type={showRepeatPassword ? "text" : "password"}
              name="repeatPassword"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              {showRepeatPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>
          {repeatPassword.length > 0 && password !== repeatPassword && (
            <p className="text-red-500 text-sm">Passwords do not match</p>
          )}
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
          Register
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
};
