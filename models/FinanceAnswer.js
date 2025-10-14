import mongoose from "mongoose";

const financeAnswerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    email: { type: String, required: true },
    age: { type: Number, required: true },

    investmentHorizon: {
      type: String,
      enum: [
        "Less than 1 year (short-term positioning)", 
        "1–3 years (near-term planning)", 
        "3–5 years (medium-term goals)", 
        "5–10 years (long-term growth)", 
        "10+ years (generational wealth)"
      ],
    },

    primaryIncome: {
      type: String,
      enum: [
        "Fixed salary (Government / Corporate)",
        "Business ownership",
        "Self-employed / Professional services",
        "Passive income rental, dividends)",
        "Retired",
        "Other (inheritance, trust, family office, etc.)",
      ],
    },

    incomeStability: {
      type: String,
      enum: [
        "Very stable and predictable", 
        "Moderately stable (occasional fluctuations)", 
        "Highly variable (uncertain or cyclical)"
      ],
    },

    savingPercentage: {
      type: String,
      enum: ["Less than 10%", "10–25%", "25–40%", "More than 40%"],
    },

    dependents: {
      type: String,
      enum: ["None", "1–2", "3–4", "5 or more"],
    },

    cashReserves: {
      type: String,
      enum: ["No reserves at present", "Reserves covering up to 3 months of expenses", "Reserves covering 3–6 months of expenses", "Reserves covering more than 6 months"],
    },

    investmentExposure: {
      equity: { type: Number, default: 0 },
      debtfd: { type: Number, default: 0 },
      gold: { type: Number, default: 0 },
      crypto: { type: Number, default: 0 },
      realestate: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    experience: {
      type: String,
      enum: [
        "Beginner (limited experience)", 
        "Moderate (some exposure and understanding)", 
        "Experienced (actively manage or follow markets)"
      ],
    },

    reactionToLoss: {
      type: String,
      enum: [
        "Exit investments to avoid further loss", 
        "Reduce exposure and wait cautiously", 
        "Remain invested with patience", 
        "Allocate more capital to benefit from lower valuations"
      ],
    },

    maxDeclineTolerance: {
      type: String,
      enum: [
        "Up to 5%", 
        "Up to 10%", 
        "Up to 20%", 
        "30% or more"
      ],
    },

    moneyView: {
      type: String,
      enum: [
        "Primarily as security and stability", 
        "As a tool for aggressive growth and opportunity", 
        "As a balance between safety and appreciation"
      ],
    },

    investmentGoal: {
      type: String,
      enum: [
        "Wealth creation and growth", 
        "Retirement planning", 
        "Child’s education and future planning", 
        "Tax optimization", 
        "Legacy and succession planning"
      ],
    },

    expectedReturn: {
      type: String,
      enum: [
        "Below 6% per annum", 
        "6–10% per annum", 
        "10–15% per annum", 
        "Above 15% per annum"
      ],
    },

    majorEvents: { type: String,
      enum: [
        "Purchase of property", 
        "Child’s higher education", 
        "Marriage-related expenses", 
        "Retirement transition", 
        "Business expansion", 
        "None of the above"
      ],
     },
    riskProfile: { type: String, default: "" },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

const FinanceAnswer = mongoose.model("FinanceAnswer", financeAnswerSchema);
export default FinanceAnswer;
