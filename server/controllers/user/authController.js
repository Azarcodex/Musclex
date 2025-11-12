import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendOtp } from "../../utils/sendOtp.js";
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const ExistingUser = await User.findOne({ email });
    if (ExistingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const pendingExist = await OTP.findOne({ "pendingData.email": email });
    if (pendingExist) {
      return res
        .status(400)
        .json({ message: "Otp has been already sent Pls Verify" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    // const newUser = await User.create({
    //   name,
    //   email,
    //   password: hashPassword,
    //   phone,
    //   isVerified: false,
    // });
    //otp generation
    const now = new Date();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    const pending = await OTP.create({
      otp: otpCode,
      otpCreated: now,
      expiresAt: otpExpire,
      pendingData: {
        name: name,
        email: email,
        password: hashPassword,
      },
    });
    sendOtp(email, otpCode);
    res.status(201).json({
      message: "otp has been sent pls verify it to login before 10 minutes",
      pending: pending._id,
      email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.error });
  }
};

//loginUser
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("nothing");
      return res.status(400).json({ message: "Enter Credentials" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Account not verified.Verify OTP" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      message: "logged successfully",
      token,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.error });
  }
};
