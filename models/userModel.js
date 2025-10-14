import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, 
    mobile: { 
      type: String, 
      required: false, 
      match: [/^\+?[1-9]\d{9,14}$/, "Invalid mobile number format"] 
    },
    countryCode: {
      type: String,
      required: false,
      match: [/^\+\d{1,4}$/, "Invalid country code format"] // e.g. +91, +1, +44
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isFinanceSubmitted: { type: Boolean, default: false },
    PanCard: { type: String, default: "" },
    AadharCard: { type: String, default: "" },
    dateOnBoard: { type: Date },
    riskProfile: { type: String, default: "" },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
