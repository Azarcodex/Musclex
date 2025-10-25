import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import { sendOtp } from "../../utils/sendOtp.js";

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user =await User.findOne({ email });
    if (!user) {
      return res.json({ success:false,message: "User not exist" });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.deleteMany({ userId: user._id });
    const newData = await OTP.create({
      userId: user._id,
      otp: otpCode,
      expiresAt: otpExpire,
    });
    await newData.save();
    await sendOtp(email, otpCode);
    res.json({success:true, message: "otp has been sent Pls confirm",email:email,userId:user._id });
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false, message: "failed to sent" });
  }
};
