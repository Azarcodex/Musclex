//Creating wallet if no wallet exists

import mongoose from "mongoose";
import Wallet from "../../models/wallet/walletschema.js";
import WalletHold from "../../models/wallet/reservation.js";
import WalletLedger from "../../models/wallet/wallerLedger.js";
export const createWalletifNotExist = async (userId) => {
  const existing = await Wallet.findOne({ userId: userId });
  if (existing) {
    return existing;
  }
  const wallet = await Wallet.create({
    userId: userId,
    balance: 0,
    holdBalance: 0,
  });
  return wallet;
};

//ledger
export async function createLedgerEntry({
  session,
  walletId,
  userId,
  amount,
  type,
  referenceId = null,
  note = "",
}) {
  const [entry] = await WalletLedger.create(
    [
      {
        walletId,
        userId,
        amount,
        type,
        referenceId,
        note,
      },
    ],
    { session }
  );

  return entry;
}

// Creating fund add Option
export async function addFunds(userId, amount, referenceId = null, note = "") {
  if (amount <= 0) throw new Error("Amount must be Positive");
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const wallet = await Wallet.findOne({ userId: userId }).session(session);
    if (!wallet) throw new Error("Wallet not found");
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });
    await createLedgerEntry({
      session,
      walletId: wallet._id,
      userId,
      amount,
      type: "ADD",
      referenceId,
      note,
    });
    await session.commitTransaction();
    return wallet;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

//  Create hold (reserve funds)
export async function createHold(userId, orderId, amount, referenceId = null) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.status !== "active") throw new Error("Wallet not active");

    // available = balance - holdBalance
    const available = wallet.balance - (wallet.holdBalance || 0);
    if (available < amount) throw new Error("Insufficient available balance");

    // increase holdBalance but do NOT change total balance
    wallet.holdBalance = (wallet.holdBalance || 0) + amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });
    console.log("💚💗💗💗" + wallet._id);
    console.log("💚💗💗💗" + userId);
    console.log("💚💗💗💗" + orderId);
    console.log("💚💗💗💗" + amount);
    // create hold record
    const [hold] = await WalletHold.create(
      [{ userId, walletId: wallet._id, orderId, amount, status: "HELD" }],
      { session }
    );
    console.log("✅✅✅✅✅✅✅" + hold.status);

    // ledger: record HOLD as negative to reflect reserved money in history
    await createLedgerEntry({
      session,
      walletId: wallet._id,
      userId,
      amount: -amount,
      type: "HOLD",
      referenceId: referenceId || orderId,
      note: "Reserved for order",
    });
    await session.commitTransaction();
    return hold;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

//finalize the payment
export async function captureHold(holdId, orderId) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const hold = await WalletHold.findById(holdId).session(session);
    if (!hold) throw new Error("Hold not found");
    if (hold.status !== "HELD") throw new Error("Hold not in held state");
    if (String(hold.orderId) !== String(orderId))
      throw new Error("Order mismatch");

    const wallet = await Wallet.findById(hold.walletId).session(session);
    if (!wallet) throw new Error("Wallet not found");

    wallet.holdBalance = Math.max(0, wallet.holdBalance - hold.amount);
    wallet.balance = Math.max(0, (wallet.balance || 0) - hold.amount);
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    //ledger setup
    await createLedgerEntry({
      session,
      walletId: wallet._id,
      userId: hold.userId,
      amount: -hold.amount,
      type: "DEDUCT",
      referenceId: orderId,
      note: "Captured for Order",
    });
    hold.status = "CAPTURED";
    await hold.save({ session });
    await session.commitTransaction();
    return { hold, wallet };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

//release hold
export async function releaseHold(holdId, reason = "order Cancelled") {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const hold = await WalletHold.findById(holdId).session(session);

    const wallet = await Wallet.findById(hold.walletId).session(session);
    if (!wallet) throw new Error("Wallet not found");

    // decrease holdBalance but do NOT double-add to balance (we already reserved by decrementing ledger as HOLD)
    wallet.holdBalance = Math.max(0, (wallet.holdBalance || 0) - hold.amount);
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    await createLedgerEntry({
      session,
      walletId: wallet._id,
      userId: hold.userId,
      amount: hold.amount,
      type: "RELEASE",
      referenceId: hold.orderId,
      note: reason,
    });

    // mark hold released
    hold.status = "RELEASED";
    await hold.save({ session });

    await session.commitTransaction();
    return { hold, wallet };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

//fetch wallet
export async function getLedger(userId, { limit = 50, skip = 0 } = {}) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) return { entries: [], wallet: null };
  const entries = await WalletLedger.find({ walletId: wallet._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return { wallet, entries };
}
