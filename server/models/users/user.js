import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    //referral

    referralCode: {
      type: String,
      unique: true,
      index: true,
    },

    referredBy: {
      type: String,
      default: null,
    },

    hasReferralReward: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//auto generate referral
userSchema.post("save", async function (doc, next) {
  try {
    if (!doc.referralCode) {
      doc.referralCode = generateReferralCode(doc._id);
      await doc.save();
    }
    next();
  } catch (err) {
    next(err);
  }
});

function generateReferralCode(id) {
  // last 6 chars of user ObjectId + 2 random chars
  const suffix = id.toString().slice(-6).toUpperCase();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const random =
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)];

  return random + suffix; // Example: "QK91AB33"
}

const User = mongoose.model("User", userSchema);
export default User;
