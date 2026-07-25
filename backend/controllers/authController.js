import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ======================
// Register User
// ======================
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create user (Plain Text Password)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
    });

    res.status(201).json({
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

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// Login User
// ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("================================");
    console.log("Login Request Received");
    console.log("Email:", email);

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");

      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("User Found:", user.email);
    console.log("Entered Password:", password);
    console.log("Database Password:", user.password);

    // Compare Plain Password
    if (password !== user.password) {
      console.log("Password mismatch");

      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("Password matched");

    // Create JWT
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

    console.log("Login Successful");

    res.status(200).json({
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

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// Get Logged-in User
// ======================
export const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("Profile Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};