import mongoose from "mongoose";

const equityMFSchema = new mongoose.Schema({
  amc: String,
  folioNumber: String,
  mode: { type: String, enum: ["SIP", "Lumpsum", "STP", "SWP"] },
  sipAmount: Number,
  stepUpAmount: Number,
  lumpsumAmount: Number,
  startDate: Date,
  frequency: String,
  self: Boolean,
  stpDetails: {
    fromFolio: String,
    toFolio: String,
    amount: Number,
    startDate: Date,
  },
  swpDetails: {
    amount: Number,
    startDate: Date,
    frequency: String,
  },
  suggestedStartDate: Date,
  suggestedEndDate: Date,
  remarks: String,
  currentValue: Number,
});

const equityStockSchema = new mongoose.Schema({
  stockName: String,
  investPrice: Number,
  currentValue: Number,
  qty: Number,
  purchaseDate: Date,
  self: Boolean,
  suggestedStartDate: Date,
  suggestedEndDate: Date,
  remarks: String,
});

const debtSchema = new mongoose.Schema({
  instrumentName: String,
  amountInvested: Number,
  startDate: Date,
  maturityDate: Date,
  interestRate: Number,
  interestFrequency: String,
  self: Boolean,
  suggestedStartDate: Date,
  suggestedEndDate: Date,
  remarks: String,
});

const otherinvestment = new mongoose.Schema({
  name: String,
  investPrice: Number,
  currentValue: Number,
  purchaseDate: Date,
  self: Boolean,
  suggestedStartDate: Date,
  suggestedEndDate: Date,
  remarks: String,
});

const insuranceSchema = new mongoose.Schema({
  policyName: String,
  type: { type: String, enum: ["Term", "Medical", "Life", "ULIP", "Other"] },
  sumAssured: Number,
  premiumAmount: Number,
  premiumFrequency: String,
  policyStartDate: Date,
  maturityDate: Date,
  expectedReturn: Number,
});

const liabilitySchema = new mongoose.Schema({
  loanType: String,
  lenderName: String,
  outstandingBalance: Number,
  emiAmount: Number,
  interestRate: Number,
  tenureStart: Date,
  tenureEnd: Date,
  isClosed: Boolean,
});

const financialDataSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },

    equityMutualFunds: [equityMFSchema],

    equityStocks: [equityStockSchema],

    debtAndFixedIncome: [debtSchema],
    otherinvestment: [otherinvestment],

    insurancePolicies: [insuranceSchema],
    liabilities: [liabilitySchema],
  },
  { timestamps: true }
);

export default mongoose.model("FinancialData", financialDataSchema);
