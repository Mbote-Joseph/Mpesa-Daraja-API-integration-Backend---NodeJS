import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/lipaRoute";
import { getPaymentStatus, setPaymentStatus } from "./controllers/stkController";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send("<h1>✅ M-Pesa Daraja STK Push API is Running</h1>");
});

app.use("/lipa", router);

// ✅ Callback endpoint from Safaricom
app.post("/mpesa/callback", (req, res) => {
  const callback = req.body.Body?.stkCallback;

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

// ✅ Expose payment status for frontend polling
app.get("/lipa/status", (_req, res) => {
  res.json({ status: getPaymentStatus() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
