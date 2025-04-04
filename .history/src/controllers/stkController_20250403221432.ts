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

import axios from "axios";
import { Response } from "express";
import { RequestExtended } from "../middlewares/generateToken";
import { timestamp } from "../utils/timeStamp";

// Global variable to track payment status
let latestPaymentStatus: 'pending' | 'success' | 'failed' = 'pending';

export const getPaymentStatus = () => latestPaymentStatus;
export const setPaymentStatus = (status: 'pending' | 'success' | 'failed') => {
  latestPaymentStatus = status;
};

export const handleStkPush = async (req: RequestExtended, res: Response) => {
  const { phone, amount } = req.body;

  const shortcode = process.env.MPESA_BUSINESS_SHORT_CODE!;
  const passkey = process.env.MPESA_PASS_KEY!;
  const time = timestamp;

  const password = Buffer.from(shortcode + passkey + time).toString("base64");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: time,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://yourdomain.com/mpesa/callback", // MUST be HTTPS
    AccountReference: "TestAccount",
    TransactionDesc: "Test Payment",
  };

  console.log("📦 Payload:", payload);
  console.log("🔐 Using Token:", req.token);

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      }
    );

    console.log("✅ STK Push Response:", response.data);
    latestPaymentStatus = 'pending'; // Reset status before callback
    res.status(200).json({ message: "STK Push Sent", data: response.data });
  } catch (error: any) {
    console.error("❌ STK Push Error:", error.message);
    res.status(403).json({ message: "STK Push Failed", error: error.message });
  }
};
