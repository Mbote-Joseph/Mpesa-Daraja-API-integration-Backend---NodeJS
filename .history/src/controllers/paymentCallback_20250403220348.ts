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

let latestPaymentStatus: any = {}; // You can replace this with a DB later

export const handleCallback = (req: Request, res: Response) => {
  const callback = req.body.Body.stkCallback;

  const status = {
    checkoutRequestID: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    metadata: callback.CallbackMetadata?.Item || []
  };

  console.log("✅ Payment Callback Received:", status);

  // Save latest payment status
  latestPaymentStatus[callback.CheckoutRequestID] = status;

  return res.status(200).json({ message: "Callback received successfully" });
};

export const checkStatus = (req: Request, res: Response) => {
  const { checkoutRequestID } = req.query;
  const status = latestPaymentStatus[checkoutRequestID as string];

  if (!status) return res.status(404).json({ message: "No status yet." });

  return res.status(200).json(status);
};
