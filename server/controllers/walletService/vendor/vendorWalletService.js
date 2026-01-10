import VendorWallet from "../../../models/vendors/vendorWallet.js";
import VendorWalletLedger from "../../../models/vendors/vendorLedger.js";
import { DEFAULT_COMMISSION_PERCENT } from "../../../config/commission.js";

export const splitCommission = (
  amount,
  percent = DEFAULT_COMMISSION_PERCENT
) => {
  const adminCommission = Number(((amount * percent) / 100).toFixed(2));
  const vendorEarning = Number((amount - adminCommission).toFixed(2));
  return { adminCommission, vendorEarning };
};

export const ensureVendorWallet = async (vendorId) => {
  let wallet = await VendorWallet.findOne({ vendorId });
  if (!wallet) wallet = await VendorWallet.create({ vendorId, balance: 0 });
  return wallet;
};

export const creditVendorForOrder = async ({
  vendorId,
  orderId,
  amount,
  commissionPercent,
}) => {
  const { vendorEarning, adminCommission } = splitCommission(
    amount,
    commissionPercent
  );
  const wallet = await ensureVendorWallet(vendorId);
  console.log("VENDOR WALLETID" + wallet);
  wallet.balance = Number((wallet.balance + vendorEarning).toFixed(2));
  await wallet.save();

  const ledger = await VendorWalletLedger.create({
    walletId: wallet._id,
    vendorId,
    orderId,
    type: "ORDER_EARNING",
    amount: vendorEarning,
    note: `Earning for order ${orderId}. Admin commission ${adminCommission}`,
  });

  return { wallet, ledger, vendorEarning, adminCommission };
};

export const reversalForOrder = async ({
  vendorId,
  orderId,
  amount,
  commissionPercent,
}) => {
  const { vendorEarning, adminCommission } = splitCommission(
    amount,
    commissionPercent
  );
  const wallet = await VendorWallet.findOne({ vendorId });
  if (!wallet) throw new Error("Vendor wallet not found");

  const toDeduct = Math.min(wallet.balance, vendorEarning);
  wallet.balance = Number((wallet.balance - toDeduct).toFixed(2));
  await wallet.save();

  const ledger = await VendorWalletLedger.create({
    walletId: wallet._id,
    vendorId,
    orderId,
    type: "REVERSAL",
    amount: toDeduct,
    note: `Reversal for order ${orderId}`,
  });

  return {
    wallet,
    ledger,
    deducted: toDeduct,
    expected: vendorEarning,
    adminCommission,
  };
};
