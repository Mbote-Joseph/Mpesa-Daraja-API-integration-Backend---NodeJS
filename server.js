// Copyright 2025 josephmbote
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { format } = require("date-fns"); // Using date-fns for timestamps
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Environment Variables
const PORT = process.env.PORT || 3000;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORTCODE = process.env.BUSINESS_SHORTCODE;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;
const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke";

// 1. Generate Access Token
const generateAccessToken = async () => {
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error.message);
    return null;
  }
};

// Generate Timestamp & Password
function generateTimestampAndPassword() {
  const timestamp = format(new Date(), "yyyyMMddHHmmss"); // Using date-fns
  const password = Buffer.from(
    `${BUSINESS_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
  ).toString("base64");
  return { timestamp, password };
}

// 2. Initiate STK Push
app.post("/stkpush", async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount)
    return res.status(400).json({ error: "Phone and Amount are required" });

  try {
    const accessToken = await generateAccessToken();
    if (!accessToken)
      return res.status(500).json({ error: "Failed to get access token" });

    const { timestamp, password } = generateTimestampAndPassword();

    const requestBody = {
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
      TransactionDesc: "Payment for services",
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      requestBody,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return res.json(response.data);
  } catch (error) {
    console.error("STK Push Error:", error.message);
    res.status(500).json({ error: "Failed to initiate STK Push" });
  }
});

// 3. Handle Callback
app.post("/callback", (req, res) => {
  console.log("Received Callback:", JSON.stringify(req.body, null, 2));

  const { Body } = req.body;
  const stkCallback = Body.stkCallback;

  if (stkCallback.ResultCode === 0) {
    const details = stkCallback.CallbackMetadata.Item.reduce((acc, item) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {});
    console.log("Transaction Successful:", details);
    res.json({ message: "Payment Successful", details });
  } else {
    console.log("Transaction Failed:", stkCallback.ResultDesc);
    res.status(400).json({ error: stkCallback.ResultDesc });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
