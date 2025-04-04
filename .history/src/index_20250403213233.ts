import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/lipaRoute";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("M-Pesa Daraja STK Push API is live");
});

app.get("/", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send("<h1>✅ M-Pesa Daraja STK Push API is Running</h1>");
  });


  app.post('/mpesa/callback', express.json(), (req, res) => {
    const callbackData = req.body;
  
    console.log('Callback received:', JSON.stringify(callbackData, null, 2));
  
    // Check if transaction was successful
    const resultCode = callbackData?.Body?.stkCallback?.ResultCode;
  
    if (resultCode === 0) {
      console.log('✅ Payment confirmed!');
      // Save status to a DB or in-memory store
    } else {
      console.log('❌ Payment failed or cancelled.');
    }
  
    res.sendStatus(200);
  });
  
  

app.use("/lipa", router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

