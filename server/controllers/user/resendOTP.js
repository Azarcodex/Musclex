import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import { sendOtp } from "../../utils/sendOtp.js";
import MESSAGES from "../../constants/messages.js";



export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const pending = await OTP.findOne({ "pendingData.email": email });

    if (!pending)
      return res.status(400).json({ message: MESSAGES.NO_PENDING_REGISTRATION });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    pending.otp = newOtp;
    pending.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5min
    await pending.save();

    await sendOtp(email, newOtp);

    res.json({ message: MESSAGES.OTP_RESENT });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: MESSAGES.SERVER_ERROR });
  }
};
