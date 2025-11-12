import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import { sendOtp } from "../../utils/sendOtp.js";

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const now = new Date();
    const otp = await OTP.findOne({ userId: user._id });
    if (otp) {
      console.log("otp exist");
      const otpCreatedx = otp.otpCreated ?? otp.createdAt ?? null;
      const otpCreatedDate = new Date(otpCreatedx);
      const diff = (now - otpCreatedDate) / 1000;
      console.log("kkk"+diff);
      // if (diff < 60) {
      //   console.log("hi");
      //   const wait = Math.ceil(60 - diff);
      //   console.log(wait);
      //   return res.json({
      //     message: `Please wait for ${wait} to resend OTP`,
      //   });
      // }
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.deleteMany({ userId: user._id });
    const newData = new OTP({
      userId: user._id,
      otp: otpCode,
      expiresAt: otpExpire,
    });
    await newData.save();
    await sendOtp(email, otpCode);
    res.status(200).json({ message: "otp has been resented pls confirm" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.error });
  }
};
