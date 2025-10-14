import FinancialData from "../models/FinancialData.js";

/**
 * Create or Update Financial Data
 */
export const upsertFinancialData = async (req, res) => {
  try {
    const { userId, email, equityMutualFunds, equityStocks , debtAndFixedIncome, otherinvestment, insurancePolicies, liabilities } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ message: "User ID and Email are required" });
    }

    const existing = await FinancialData.findOne({ userId, email });

    if (existing) {
      existing.equityMutualFunds = equityMutualFunds || existing.equityMutualFunds;
      existing.equityStocks = equityStocks || existing.equityStocks;
      existing.debtAndFixedIncome = debtAndFixedIncome || existing.debtAndFixedIncome;
      existing.insurancePolicies = insurancePolicies || existing.insurancePolicies;
      existing.otherinvestment = otherinvestment || existing.otherinvestment;
      existing.liabilities = liabilities || existing.liabilities;
      existing.lastUpdated = Date.now();
      await existing.save();
      return res.status(200).json({ message: "Financial data updated successfully", data: existing });
    }

    const newData = new FinancialData({ userId, email, equityMutualFunds, equityStocks, debtAndFixedIncome, otherinvestment, insurancePolicies, liabilities });
    await newData.save();
    return res.status(201).json({ message: "Financial data saved successfully", data: newData });
  } catch (err) {
    console.error("Error saving financial data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get Financial Data by User
 */
export const getFinancialData = async (req, res) => {
  try {
    const { userId, email } = req.query;
    if (!userId && !email) {
      return res.status(400).json({ message: "User ID or Email is required" });
    }

    const data = await FinancialData.findOne({ $or: [{ userId }, { email }] });
    if (!data) {
      return res.status(404).json({ message: "No financial data found" });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching financial data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete Financial Data
 */
export const deleteFinancialData = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId && !email) {
      return res.status(400).json({ message: "User ID or Email is required" });
    }

    const deleted = await FinancialData.findOneAndDelete({ $or: [{ userId }, { email }] });
    if (!deleted) {
      return res.status(404).json({ message: "No record found to delete" });
    }

    res.status(200).json({ message: "Financial data deleted successfully" });
  } catch (err) {
    console.error("Error deleting financial data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get All Financial Data (Admin Use)
 */
export const getAllFinancialData = async (req, res) => {
  try {
    const data = await FinancialData.find().populate("userId", "name email");
    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching all financial data:", err);
    res.status(500).json({ message: "Server error" });
  }
};
