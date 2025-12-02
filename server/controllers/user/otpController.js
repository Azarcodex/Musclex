import OTP from "../../models/users/otp.js";
import User from "../../models/users/user.js";
import Wallet from "../../models/wallet/walletschema.js";
import ReferralReward from "../../models/referral/referral.js";
import WalletLedger from "../../models/wallet/wallerLedger.js";
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
    if (pending.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }
    // 3️Expiry check
    if (pending.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: pending._id });
      return res.status(410).json({ message: "OTP expired" });
    }
    // const verify = await OTP.findOne({ otp: otp });
    // if (!verify) {
    //   return res.status(400).json({ message: "Invalid otp detected" });
    // }
    const { name, password, referralCode } = pending.pendingData;

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
      referredBy: referralCode ? referralCode : null,
    });
    //wallet creation for the user
    const userWallet = await Wallet.create({
      userId: newUser._id,
      balance: 0,
      totalAdded: 0,
      totalSpent: 0,
      lastTransactionAt: null,
    });
    //referral logic
    // -----------------------------------------------
    // 🔥 TWO-SIDED REFERRAL LOGIC
    // -----------------------------------------------
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });

      if (referrer) {
        const REFERRER_REWARD = 50;
        const NEW_USER_REWARD = 20;

        userWallet.balance += NEW_USER_REWARD;
        await userWallet.save();

        await WalletLedger.create({
          walletId: userWallet._id,
          userId: newUser._id,
          amount: NEW_USER_REWARD,
          type: "REFERRAL",
          referenceId: newUser._id,
          note: "Referral signup reward (new user)",
        });

        // Record referral history for new user
        await ReferralReward.create({
          referrerUserId: referrer._id,
          referredUserId: newUser._id,
          rewardAmount: NEW_USER_REWARD,
          rewardType: "SIGNUP_NEW_USER",
        });

        //Credit for refferral

        const referrerWallet = await Wallet.findOne({ userId: referrer._id });

        referrerWallet.balance += REFERRER_REWARD;
        await referrerWallet.save();

        await WalletLedger.create({
          walletId: referrerWallet._id,
          userId: referrer._id,
          amount: REFERRER_REWARD,
          type: "REFERRAL",
          referenceId: newUser._id,
          note: "Referral reward for inviting a user",
        });

        // Record referral history for referrer
        await ReferralReward.create({
          referrerUserId: referrer._id,
          referredUserId: newUser._id,
          rewardAmount: REFERRER_REWARD,
          rewardType: "SIGNUP_REFERRER",
        });

        newUser.hasReferralReward = true;
        await newUser.save();
      }
    }

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
