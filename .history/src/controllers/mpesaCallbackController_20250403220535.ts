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

// import { Request, Response } from "express";

// let paymentStatus = "pending"; // Save in DB for production!

// export const handleMpesaCallback = (req: Request, res: Response) => {
//   const body = req.body;

//   const stkCallback = body.Body?.stkCallback;
//   const resultCode = stkCallback?.ResultCode;

//   console.log("📞 M-Pesa Callback Received:", JSON.stringify(stkCallback, null, 2));

//   if (resultCode === 0) {
//     console.log("✅ Payment Successful");
//     paymentStatus = "success";
//   } else {
//     console.log("❌ Payment Failed/Cancelled");
//     paymentStatus = "failed";
//   }

//   res.status(200).json({ message: "Callback received" });
// };

// export const checkPaymentStatus = (_req: Request, res: Response) => {
//   res.json({ status: paymentStatus });
// };
