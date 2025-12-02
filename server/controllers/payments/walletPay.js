import crypto from "crypto";
import Wallet from "../../models/wallet/walletschema.js";
import WalletLedger from "../../models/wallet/wallerLedger.js";
import { razorpayInstance } from "../../utils/Razorpay.js";

export const createWalletOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "wallet_" + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create wallet order" });
  }
};

export const verifyWalletPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;
    console.log(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    );
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature mismatch" });
    }

    const userId = req.user._id;

    // FETCH WALLET OR CREATE NEW
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    // UPDATE BALANCE
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    // LEDGER ENTRY
    await WalletLedger.create({
      walletId: wallet._id,
      userId,
      amount,
      type: "ADD",
      referenceId: razorpay_payment_id,
      note: "Money added to wallet via Razorpay",
    });

    res.status(200).json({
      success: true,
      message: "Wallet updated successfully",
      newBalance: wallet.balance,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Wallet verification failed" });
  }
};
