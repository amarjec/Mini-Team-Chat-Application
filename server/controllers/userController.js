import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to set cookie
const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // True in production, False locally
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // None in prod, Lax locally
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
export const registerUser = async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);
      setTokenCookie(res, token); // <--- Set Cookie here

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      setTokenCookie(res, token); // <--- Set Cookie here

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Expire cookie immediately
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get all users
// @route   GET /api/auth/users
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users but ONLY return id, username, and email (select specific fields)
    const users = await User.find({}, "_id username email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};