import cron from "node-cron";
import { cleanupPendingTempOrders } from "../utils/tempOrderCleanUp.js";

/**
 * Runs every day at 3 AM
 * (Low traffic, safe time)
 */
cron.schedule("0 3 * * *", async () => {
  console.log("[CRON] Running TempOrder cleanup...");
  await cleanupPendingTempOrders();
});
