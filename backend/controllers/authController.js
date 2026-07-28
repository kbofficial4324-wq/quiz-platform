import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ==============================
// Register User
// ==============================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("================================");
    console.log("Register Request Received");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Role:", role);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Plain-text password as requested
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: role || "student",
    });

    console.log("Registration successful:", user.email);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// Login User
// ==============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("================================");
    console.log("Login Request Received");
    console.log("Email:", email);
    console.log("Password:", password);

    if (!email || !password) {
      console.log("Email or password missing");

      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      console.log("User not found");

      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("User found:", user.email);
    console.log("Entered Password:", password);
    console.log("Stored Password:", user.password);

    // Plain-text password comparison
    if (password !== user.password) {
      console.log("Password mismatch");

      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("Password matched");

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("Login successful");
    console.log("User:", user.email);
    console.log("Role:", user.role);
    console.log("================================");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==============================
// Get Logged-in User Profile
// ==============================
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Profile Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};