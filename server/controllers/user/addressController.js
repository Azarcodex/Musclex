import MESSAGES from "../../constants/messages.js";
import Address from "../../models/users/address.js";

export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      fullName,
      phone,
      pincode,
      state,
      city,
      addressLine,
      landmark,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId }, { $set: { isDefault: false } });
    }

    const address = await Address.create({
      userId,
      fullName,
      phone,
      pincode,
      state,
      city,
      addressLine,
      landmark,
      isDefault: !!isDefault,
    });

    return res.status(201).json({ success: true, address });
  } catch (err) {
    console.error("addAddress error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || MESSAGES.INTERNAL_SERVER_ERROR,
      });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean();
    return res.status(200).json({ success: true, addresses });
  } catch (err) {
    console.error("getAddresses error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: err.message || MESSAGES.INTERNAL_SERVER_ERROR,
      });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user._id;
    const { isDefault } = req.body;
    const existing = await Address.findOne({ _id: id, userId: user });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: MESSAGES.ADDRESS_NOT_FOUND });
    }
    if (isDefault) {
      await Address.updateMany(
        { userId: user },
        { $set: { isDefault: false } }
      );
    }
    const updated = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ success: true, message: MESSAGES.UPDATED_SUCCESSFULLY });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal Error" });
  }
};
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const address = await Address.findOne({ _id: id, userId: userId });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: MESSAGES.UPDATED_SUCCESSFULLY });
    }
    await Address.deleteOne({ _id: id });
    if (address.isDefault) {
      const another = await Address.findOne({ userId: userId }).sort({
        createdAt: -1,
      });
      another.isDefault = true;
      await another.save();
    }
    res
      .status(200)
      .json({ success: true, message: MESSAGES.DELETED_SUCCESSFULLY });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal servor error" });
  }
};
//default address
export const DefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const address = await Address.findOne({ _id: id, userId: userId });
    if (address.isDefault) {
      return res.status(201).json({ message: "address is already default" });
    }
    await Address.updateMany(
      { userId: userId },
      { $set: { isDefault: false } }
    );
    address.isDefault = true;
    await address.save();
    res.status(201).json({ message: "Address set as default" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
