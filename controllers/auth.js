import User from "../models/User.js";
import validator from "validator";
import { JsonToken, tokenVerify } from "../util/jsonToken.js";

export const Login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password) {
      return res
        .status(404)
        .json({ success: false, message: "Please enter all the fields" });
    }

    if (!validator.isEmail(email) && !validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Enter strong password and valid email address",
      });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter valid email id" });
    }

    const isUser = await User.findOne({ email: email.toLowerCase() });

    if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "User dosen't exist",
      });
    }
    const auth = await User.findOne({ password: password });

    if (!auth) {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    if (userType != isUser.usertype) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (isUser) {
      const token = JsonToken(isUser._id);
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        id: isUser._id,
        username: isUser.username,
        jwt: token,
      });
    }
    next();
  } catch (error) {
    console.log("Login", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUser = async (req, res, next) => {
  const { token } = req.body;
  console.log("Received token:", token);

  try {
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = tokenVerify(token);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.id);
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        userId: decoded.id,
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
