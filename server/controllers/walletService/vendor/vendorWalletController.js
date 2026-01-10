import VendorWalletLedger from "../../../models/vendors/vendorLedger.js";
import VendorWithdrawal from "../../../models/vendors/vendorwithdrawal.js";
import VendorWallet from "../../../models/vendors/vendorWallet.js";

export const getVendorWallet = async (req, res) => {
  const vendorId = req.vendor._id;
  const wallet = (await VendorWallet.findOne({ vendorId })) || {
    balance: 0,
    _id: null,
  };
  const ledger = await VendorWalletLedger.find({ vendorId })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ wallet, ledger });
};

// Vendor: request withdrawal
export const requestWithdrawal = async (req, res) => {
  const vendorId = req.vendor._id;
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Invalid amount" });

  const wallet = await VendorWallet.findOne({ vendorId });
  if (!wallet || wallet.balance < amount)
    return res.status(400).json({ message: "Insufficient balance" });

  wallet.balance = Number((wallet.balance - amount).toFixed(2));
  await wallet.save();

  const withdrawal = await VendorWithdrawal.create({ vendorId, amount });

  // ledger entry
  await VendorWalletLedger.create({
    vendorWalletId: wallet._id,
    vendorId,
    type: "WITHDRAWAL",
    amount,
    note: `Withdrawal requested ${withdrawal._id}`,
  });

  res.json({ success: true, withdrawal });
};

// Admin: list withdrawals
export const adminListWithdrawals = async (req, res) => {
  const items = await VendorWithdrawal.find().sort({ createdAt: -1 });
  res.json({ items });
};

// Admin: approve (after manual payout)
export const adminApproveWithdrawal = async (req, res) => {
  const { id } = req.params;
  const { payoutReference } = req.body;
  const w = await VendorWithdrawal.findById(id);
  if (!w) return res.status(404).json({ message: "Not found" });

  w.status = "PAID";
  w.processedAt = new Date();
  w.payoutReference = payoutReference || null;
  await w.save();

  res.json({ success: true, withdrawal: w });
};
