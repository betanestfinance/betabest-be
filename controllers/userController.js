import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailer.js";
import User from "../models/userModel.js";
import FinanceAnswer from "../models/FinanceAnswer.js";

// @desc Get all users
// @route GET /api/users
export const getUsers = async (req, res) => {
    console.log("getusers logs");
  try {
    const users = await User.find().select("-password"); // don't send password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create new user
// @route POST /api/users
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();

    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      updatedAt: savedUser.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update user
// @route PUT /api/users/:id
export const updateUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete user
// @route DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("loginUser called with:", email, password);

  try {
    const user = await User.findOne({ email });
    const financeAnswer = await FinanceAnswer.find({ email }).sort({ createdDate: -1 }).limit(1);
    console.log("financeAnswer:", financeAnswer);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, mobile: user.mobile, countryCode: user.countryCode, isFinanceSubmitted: user.isFinanceSubmitted, riskProfile: user.riskProfile, riskScore: user.riskScore, dateOnBoard: user.dateOnBoard, age: financeAnswer[0]?.age }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, isFinanceSubmitted: user.isFinanceSubmitted, riskProfile: user.riskProfile, riskScore: user.riskScore, dateOnBoard: user.dateOnBoard, mobile: user.mobile, countryCode: user.countryCode, age: financeAnswer[0]?.age } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generatePasswordResetToken = async (user, expiryHours = 24) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + expiryHours * 60 * 60 * 1000;
  await user.save();

  return rawToken; // return raw so it can be emailed
};

export const inviteUser = async (req, res) => {
  try {
    const { firstName, lastName, email, countryCode, mobile} = req.body;
    let financeAnswerExist = await FinanceAnswer.findOne({ email });
    let isFinanceSubmitted = financeAnswerExist ? true : false;
  
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ firstName, lastName, email, countryCode, mobile, isFinanceSubmitted: isFinanceSubmitted, riskProfile: "", riskScore: 0, dateOnBoard: new Date()}); // no password yet
    }

    let financeAnswer = await FinanceAnswer.findOne({ email });
    console.log("financeAnswer in inviteUser:", financeAnswer);
    if (financeAnswer) {
      await FinanceAnswer.updateOne(
          {email: email},
          { $set: { user: user._id }},
          { new: true }
        );
       await User.findByIdAndUpdate(
          user._id,
          { $set: { riskProfile: financeAnswer?.riskProfile, riskScore: financeAnswer?.riskScore, isFinanceSubmitted: true }},
          { new: true }
        );
    }
    // create token with 15m expiry
    // const token = jwt.sign(
    //   { id: user._id },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "24h" }
    // );
    const rawToken = await generatePasswordResetToken(user);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

    await sendMail(
      email,
      "Set your password",
      `<p>Hello ${firstName},</p>
       <p>You are invited to BetaNest. Click on set password to begin the journey (expires in 24 hours): <a href="${resetLink}">Set Password</a> </p>`
    );

    res.json({ message: "Invite sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Hash provided token for lookup
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "Password reset successful. Please log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal existence
      return res.json({ message: "If account exists, reset link will be sent" });
    }

    const rawToken = await generatePasswordResetToken(user);

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendMail(
      email,
      "Password Reset Request",
      `<p>Hello ${user?.firstName},</p>
        <p>You requested a password reset. Click on reset password to change the password: <a href="${resetLink}">Reset Password</a></p>`
    );

    res.json({ message: "If account exists, reset link will be sent" });
  } catch (err) {
    console.error("Request reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const contactUs = async (req, res) => {
  try {
    const { name, email, message} = req.body;

    await sendMail(
      "betanest.finance@gmail.com",
      `Contact from ${name}`,
      `<p>Hello Chandra</p>
       <p>${name} contacted from contact us form with below message</p>
       <p>${message}</p>
       <p>Email: ${email}</p>
       `
    );

    res.json({ message: "We will contact you soon on a mail" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
