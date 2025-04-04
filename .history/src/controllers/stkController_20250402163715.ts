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

export const handleStkPush = async (req: RequestExtended, res: Response) => {
  const { phone, amount } = req.body;
  const shortcode = process.env.MPESA_BUSINESS_SHORT_CODE!;
  const passkey = process.env.MPESA_PASS_KEY!;
  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://example.com/callback", // replace with your real endpoint
    AccountReference: "Ref001",
    TransactionDesc: "Test Payment",
  };

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
    res.status(200).json({ message: "STK push sent", data: response.data });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to send STK push", error: error.message });
  }
};
