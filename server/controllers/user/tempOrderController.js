import mongoose from "mongoose";
import MESSAGES from "../../constants/messages.js";
import STATUS_CODES from "../../constants/statuscodes.js";
import TempOrder from "../../models/payment/payment.js";

export const removeTempOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "Invalid temp order ID",
      });
    }

    const tempOrder = await TempOrder.findOneAndDelete({
      _id: id,
      userID: userId,
    });

    if (!tempOrder) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "Temp order not found",
      });
    }

    res.status(STATUS_CODES.OK).json({ success: true });
  } catch (e) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
