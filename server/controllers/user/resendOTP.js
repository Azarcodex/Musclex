import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import { sendOtp } from "../../utils/sendOtp.js";
import MESSAGES from "../../constants/messages.js";
import STATUS_CODES from "../../constants/statuscodes.js";

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const pending = await OTP.findOne({ "pendingData.email": email });

    if (!pending)
      return res
        .status(400)
        .json({ message: MESSAGES.NO_PENDING_REGISTRATION });

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

export const resendOtpForgetPassword = async (req, res) => {
  try {
    const { userId } = req.body;

    // 1️⃣ User must exist
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    // 2️⃣ Generate OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 3️⃣ Create or update OTP for this user
    await OTP.findOneAndUpdate(
      { userId },
      { otp: newOtp, expiresAt },
      { upsert: true, new: true }
    );

    // 4️⃣ Send OTP to user's email
    await sendOtp(user.email, newOtp);

    return res.json({ message: MESSAGES.OTP_RESENT });
  } catch (err) {
    console.error(err);
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};
