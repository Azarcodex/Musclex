import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";

export const otpController = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById( userId );
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    const otpData = await OTP.findOne({ userId, otp });
    if (!otpData) {
      return res.status(400).json({ message: "Otp is invalid" });
    }
    if (otpData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Otp is expired" });
    }
    user.isVerified = true;
    await user.save();
    await otpData.deleteOne();
    res.json({ success: true, message: "OTP is correct,Account is activated" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.error });
  }
};
