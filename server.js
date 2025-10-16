import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import financeRoutes from "./routes/financeRoutes.js";
// dotenv.config();
dotenv.config({ path: "./.env" });
connectDB();

const app = express();

app.use(cors());
// app.use(cors({
//   origin: ["https://betanestfin.com", "https://www.betanestfin.com"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
app.use(express.json());

// Routes
app.use("/apiv1/users", userRoutes);
app.use("/apiv1/finance", financeRoutes);
app.use("/apiv1/finance/financial-data", financeRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;
app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
