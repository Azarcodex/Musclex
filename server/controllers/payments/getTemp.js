import TempOrder from "../../models/payment/payment.js";

export const getTempOrder = async (req, res) => {
  try {
    const { tempOrderId } = req.params;
    const temp = await TempOrder.findById(tempOrderId).lean();
    if (!temp) return res.status(404).json({ message: "Temp order not found" });
    return res.json({ success: true, tempOrder: temp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch temp order" });
  }
};
