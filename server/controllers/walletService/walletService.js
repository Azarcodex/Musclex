//Creating wallet if no wallet exists

import mongoose from "mongoose";
import Wallet from "../../models/wallet/walletschema.js";
import WalletHold from "../../models/wallet/reservation.js";
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
async function createLedgerEntry({
  session,
  walletId,
  userId,
  amount,
  type,
  referenceId = null,
  note = "",
}) {
  return WalletLedger.create(
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

    // create hold record
    const hold = await WalletHold.create(
      [{ userId, walletId: wallet._id, orderId, amount, status: "HELD" }],
      { session }
    );

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
    return hold[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
