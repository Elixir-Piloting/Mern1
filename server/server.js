require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/User");

const app = express();
const saltRounds = 10;

// Environment variables
const {
  PORT = 3000,
  NODE_ENV = 'development',
  MONGODB_URI = 'mongodb://localhost:27017/mydatabase',
  JWT_SECRET = 'your_super_secret_key_here',
  JWT_EXPIRES_IN = '7d',
  CLIENT_URL = 'http://localhost:5173',
  COOKIE_SECURE = false,
  COOKIE_SAME_SITE = 'lax'
} = process.env;

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposedHeaders: ["Set-Cookie"],
      preflightContinue: false
    })
  );

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to DB successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// ✅ Home Route
app.get("/", (req, res) => {
    res.send("Hello");
});

// ✅ Register Route
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields must be present" });
        }

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        // Check if login exists (username or email)
        const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare password
        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Store token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: COOKIE_SECURE === 'true',
            sameSite: COOKIE_SAME_SITE,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
          });
          
        console.log("Set-Cookie Header:", res.getHeaders()["set-cookie"]);
        res.status(200).json({ success: true, message: "Logged in successfully" });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ✅ Logout Route (Clears the cookie)
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ✅ Check Login Status Route
app.get("/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, loggedIn: false, user: null });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ success: true, loggedIn: true, user: decoded });
    } catch (error) {
        res.status(401).json({ success: false, loggedIn: false, user: null });
    }
});

// ✅ Auth Check Route for Frontend
app.get("/auth-check", (req, res) => {
    console.log("Auth-check request received");
    console.log("Cookies received:", req.cookies);
    console.log("Headers received:", req.headers);
    
    const token = req.cookies.token;
    if (!token) {
        console.log("No token found in cookies");
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token verified successfully:", decoded);
        res.status(200).json({ success: true, message: "Authenticated", user: decoded });
    } catch (error) {
        console.log("Token verification failed:", error.message);
        res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
});

app.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}`);
});
