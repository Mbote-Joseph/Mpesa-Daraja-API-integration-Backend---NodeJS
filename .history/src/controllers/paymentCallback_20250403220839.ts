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


import { Request, Response } from "express";

// In-memory store (for now)
const latestPaymentStatus: Record<string, any> = {};

// POST /lipa/callback
export const handleCallback = (req: Request, res: Response) => {
  const callback = req.body?.Body?.stkCallback;

  if (!callback || !callback.CheckoutRequestID) {
    return res.status(400).json({ message: "Invalid callback payload" });
  }

  const status = {
    checkoutRequestID: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    metadata: callback.CallbackMetadata?.Item || []
  };

  console.log("✅ Payment Callback Received:", status);

  // Store status by CheckoutRequestID
  latestPaymentStatus[callback.CheckoutRequestID] = status;

  return res.status(200).json({ message: "Callback received successfully" });
};

// GET /lipa/status?checkoutRequestID=...
export const checkStatus = (req: Request, res: Response) => {
  const checkoutRequestID = req.query.checkoutRequestID as string;

  if (!checkoutRequestID) {
    return res.status(400).json({ message: "checkoutRequestID is required" });
  }

  const status = latestPaymentStatus[checkoutRequestID];

  if (!status) {
    return res.status(404).json({ message: "No status found for this ID" });
  }

  return res.status(200).json(status);
};
