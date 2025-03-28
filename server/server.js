const express = require("express");
const { default: mongoose, get } = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const saltRounds =10;
const SECRET_KEY = "your_secret_key";


mongoose.connect("mongodb://localhost:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    ()=>{
        console.log("connected to db succesifully");
    }
).catch(err =>{
    console.error(err)
});




app.get("/", (req,res)=>{
    res.send("hello");
});


app.post("/register", async (req,res)=>{
    try{ 
    const {username, email, password} = req.body;
    if (!username || !email || !password){
        return res.status(400).json({success:false, message: "all fields must be present"});
    }

    const userExists = await User.findOne({email} || {username});
    if (userExists){
        return res.status(400).json({success:false,  message: "user exists"});
    }

    const hashedPassword = await bcrypt.hash(password,saltRounds);

    const newUser = new User({username,email, password:hashedPassword});
    await newUser.save();



    return res.status(201).json({success:true, message: "user registered succesifully"})
}
    catch(err){
        return res.status(500).json({success:false, message: "internal server error"})
    }
});




app.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        // Check if login exists (username or email)
        const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare password
        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: "7d" });

        // Store token in HTTP-only cookie (more secure)
        res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(200).json({ message: "Logged in successfully", token });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Logout Route (Clears the cookie)
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
});

// ✅ Check Login Status Route
app.get("/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ loggedIn: false, user: null });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.status(200).json({ loggedIn: true, user: decoded });
    } catch (error) {
        res.status(401).json({ loggedIn: false, user: null });
    }
});


app.listen(3000, ()=>{
console.log("app is running on port: 3000")
});