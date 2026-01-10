import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendOtp } from "../../utils/sendOtp.js";
import MESSAGES from "../../constants/messages.js";
import STATUS_CODES from "../../constants/statuscodes.js";


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;
    console.log(req.body);

    //  Password regex validation (REGISTER only)
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const ExistingUser = await User.findOne({ email });
    if (ExistingUser) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ message: MESSAGES.USER_ALREADY_EXISTS });
    }

    const pendingExist = await OTP.findOne({ "pendingData.email": email });
    if (pendingExist) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ message: MESSAGES.OTP_SENT });
    }

    const hashPassword = await bcrypt.hash(password, 10);
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
        referralCode: referralCode,
      },
    });

    sendOtp(email, otpCode);

    res.status(STATUS_CODES.CREATED).json({
      message: MESSAGES.OTP_SENT,
      pending: pending._id,
      email,
    });
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// loginUser
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.ENTER_CREDENTIALS });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.isVerified) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: MESSAGES.ACCOUNT_NOT_VERIFIED });
    }

    if (user.isBlocked) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: MESSAGES.ACCOUNT_BLOCKED });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.LOGGED_SUCCESSFULL,
      token,
      user: user,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
