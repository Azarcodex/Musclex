import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    smallHeading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String, // store image URL or path
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
