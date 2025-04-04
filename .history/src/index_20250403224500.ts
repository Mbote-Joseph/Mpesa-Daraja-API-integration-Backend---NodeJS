import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/lipaRoute";
import { getPaymentStatus, setPaymentStatus } from "./controllers/stkController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Proper CORS Setup
app.use(cors({
  origin: 'http://localhost:4200', // Use 'http://localhost:4200' in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ Health Check
app.get("/", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send("<h1>✅ M-Pesa Daraja STK Push API is Running</h1>");
});

// ✅ STK Push + Token generation route
app.use("/lipa", router);

// ✅ Callback endpoint from Safaricom
app.post("/mpesa/callback", (req: Request, res: Response) => {
  const callback = req.body?.Body?.stkCallback;

  console.log("📩 Callback received:", JSON.stringify(callback, null, 2));

  if (callback?.ResultCode === 0) {
    setPaymentStatus("success");
    console.log("✅ Payment successful");
  } else {
    setPaymentStatus("failed");
    console.log("❌ Payment failed or cancelled");
  }

  res.sendStatus(200);
});

// ✅ Polling route for frontend
app.get("/lipa/status", (_req: Request, res: Response) => {
  res.json({ status: getPaymentStatus() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
