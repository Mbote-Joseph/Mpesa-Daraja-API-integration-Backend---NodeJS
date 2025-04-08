// import express, { Request, Response } from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import router from "./routes/lipaRoute";
// import { getPaymentStatus, setPaymentStatus } from "./controllers/stkController";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // ✅ Proper CORS Setup
// app.use(cors({
//   origin: 'http://localhost:4200', // Use 'http://localhost:4200' in production
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type']
// }));

// app.use(express.json());

// // ✅ Health Check
// app.get("/", (_req: Request, res: Response) => {
//   res.setHeader("Content-Type", "text/html");
//   res.send("<h1>✅ M-Pesa Daraja STK Push API is Running</h1>");
// });

// // ✅ STK Push + Token generation route
// app.use("/lipa", router);

// // ✅ Callback endpoint from Safaricom
// app.post("/mpesa/callback", (req: Request, res: Response) => {
//   const callback = req.body?.Body?.stkCallback;

//   console.log("📩 Callback received:", JSON.stringify(callback, null, 2));

//   if (callback?.ResultCode === 0) {
//     setPaymentStatus("success");
//     console.log("✅ Payment successful");
//   } else {
//     setPaymentStatus("failed");
//     console.log("❌ Payment failed or cancelled");
//   }

//   res.sendStatus(200);
// });

// // ✅ Polling route for frontend
// app.get("/lipa/status", (_req: Request, res: Response) => {
//   res.json({ status: getPaymentStatus() });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });



import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import { format } from "date-fns";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

let paymentStatus = "pending";

// 🔹 Health Check
app.get("/", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send("<h1>✅ M-Pesa Daraja STK Push API is Running</h1>");
});

// 🔹 Helper Functions
const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  BUSINESS_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_URL
} = process.env;

const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke";

const generateAccessToken = async (): Promise<string | null> => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");

  try {
    const res = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return res.data.access_token;
  } catch (error: any) {
    console.error("❌ Failed to get access token:", error.message);
    return null;
  }
};

const generateTimestampAndPassword = () => {
  const timestamp = format(new Date(), "yyyyMMddHHmmss");
  const password = Buffer.from(
    `${BUSINESS_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
  ).toString("base64");
  return { timestamp, password };
};

// 🔹 STK Push Endpoint
app.post("/lipa/stkpush", async (req: Request, res: Response): Promise<void> => {
    const { phone, amount } = req.body;
  
    if (!phone || !amount) {
      res.status(400).json({ error: "Phone and Amount are required" });
      return;
    }
  
    const accessToken = await generateAccessToken();
    if (!accessToken) {
      res.status(500).json({ error: "Failed to generate access token" });
      return;
    }
  
    const { timestamp, password } = generateTimestampAndPassword();
  
    const payload = {
      BusinessShortCode: BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: BUSINESS_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: "Test",
      TransactionDesc: "Payment for services"
    };
  
    try {
      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      paymentStatus = "pending";
      res.json(response.data);
    } catch (error: any) {
      console.error("STK Push Error:", error.message);
      res.status(500).json({ error: "STK Push request failed" });
    }
  });
  
// 🔹 Safaricom Callback Handler
app.post("/mpesa/callback", (req: Request, res: Response) => {
  const callback = req.body?.Body?.stkCallback;

  console.log("📩 Callback received:", JSON.stringify(callback, null, 2));

  if (callback?.ResultCode === 0) {
    paymentStatus = "success";
    console.log("✅ Payment successful");
  } else {
    paymentStatus = "failed";
    console.log("❌ Payment failed:", callback?.ResultDesc);
  }

  res.sendStatus(200);
});

// 🔹 Polling route
app.get("/lipa/status", (_req: Request, res: Response) => {
  res.json({ status: paymentStatus });
});

// 🔹 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
