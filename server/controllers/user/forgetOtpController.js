import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import { sendOtp } from "../../utils/sendOtp.js";

export const forgetOtpController = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    console.log(otp, userId);
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not Exist" });
    }
    const otpdata = await OTP.findOne({ userId, otp });
    if (!otpdata) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is Incorrect!" });
    }
    await otpdata.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Verification is successful" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Failed to Sent" });
  }
};
