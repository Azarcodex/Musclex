import TempOrder from "../models/payment/payment.js";

export const cleanupPendingTempOrders = async () => {
  try {
    const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await TempOrder.deleteMany({
      paymentStatus: "Pending",
      createdAt: { $lt: expiryTime },
    });

    if (result.deletedCount > 0) {
      console.log(`[CRON] Deleted ${result.deletedCount} expired TempOrders`);
    }
  } catch (err) {
    console.error("[CRON] TempOrder cleanup failed:", err);
  }
};
