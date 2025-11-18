import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";

export const otpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp);
    if (!email || !otp) {
      return res.status(400).json({ message: "No email and token" });
    }
    const pending = await OTP.findOne({ "pendingData.email": email });
    if (!pending) {
      return res.status(400).json({ message: "no pending registration" });
    }
    const verify = await OTP.findOne({ otp: otp });
    if (!verify) {
      return res.status(400).json({ message: "Invalid otp detected" });
    }
    if (pending.expiresAt && pending.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: pending._id });
      return res.status(410).json({ message: "otp is expired" });
    }
    const { name, password } = pending.pendingData;
    const exist = await User.findOne({ email: email });
    if (exist) {
      await OTP.deleteOne({ _id: pending._id });
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = await User.create({
      name,
      email,
      password,
      isVerified: true,
    });
    await OTP.deleteOne({ _id: pending._id });
    return res.status(201).json({
      message: "Registration complete. User created and verified.",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.error });
  }
};
