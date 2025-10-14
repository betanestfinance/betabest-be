import express from "express";
import {
  saveFinanceAnswers,
  getFinanceAnswers,
  updateFinanceAnswers,
} from "../controllers/financeController.js";
import {
  upsertFinancialData,
  getFinancialData,
  deleteFinancialData,
  getAllFinancialData,
} from "../controllers/financialDataController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Save answers
router.post("/finance-answers", saveFinanceAnswers);

// Get answers by user
router.get("/finance-answers", authenticate, getFinanceAnswers);

// Update answers
router.put("/finance-answers", authenticate, updateFinanceAnswers);


router.post("/", upsertFinancialData);      
router.get("/", getFinancialData);         
router.delete("/", deleteFinancialData);   
router.get("/all", getAllFinancialData);   

export default router;
