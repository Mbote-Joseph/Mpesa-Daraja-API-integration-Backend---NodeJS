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

const latestPaymentStatus: Record<string, any> = {};

export const handleCallback = (req: Request, res: Response): void => {
  const callback = req.body?.Body?.stkCallback;

  if (!callback || !callback.CheckoutRequestID) {
    res.status(400).json({ message: "Invalid callback payload" });
    return;
  }

  const status = {
    checkoutRequestID: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    metadata: callback.CallbackMetadata?.Item || []
  };

  console.log("✅ Payment Callback Received:", status);
  latestPaymentStatus[callback.CheckoutRequestID] = status;

  res.status(200).json({ message: "Callback received successfully" });
};

export const checkStatus = (req: Request, res: Response): void => {
  const checkoutRequestID = req.query.checkoutRequestID as string;

  if (!checkoutRequestID) {
    res.status(400).json({ message: "checkoutRequestID is required" });
    return;
  }

  const status = latestPaymentStatus[checkoutRequestID];

  if (!status) {
    res.status(404).json({ message: "No status found for this ID" });
    return;
  }

  res.status(200).json(status);
};
