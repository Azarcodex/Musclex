import Wallet from "../../models/wallet/walletschema.js";
import WalletHold from "../../models/wallet/reservation.js";
import WalletLedger from "../../models/wallet/wallerLedger.js";
export const walletDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const wallet = await Wallet.findOne({ userId });
    const ledgers = await WalletLedger.find({ userId }).sort({ createdAt: -1 });
    const holds = await WalletHold.find({ userId }).sort({ createdAt: -1 });
    const excluded = ["HOLD", "RELEASE"];
    const ledger = ledgers.filter((l) => !excluded.includes(l.type));
    return res.status(200).json({
      success: true,
      wallet,
      ledger,
      holds,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//wallet payment

