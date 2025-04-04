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
import { Request, Response, NextFunction } from "express";

// Extend request type to include token
export type RequestExtended = Request & { token?: string };

export const generateToken = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;

    console.log("🟢 Generating access token...");
    console.log("🔑 CONSUMER KEY:", consumerKey);
    console.log("🔐 CONSUMER SECRET:", consumerSecret);

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const token = response.data.access_token;
    console.log("✅ Access Token:", token);

    req.token = token;
    next();
  } catch (error: any) {
    console.error("❌ Failed to generate token:", error.message);
    res.status(500).json({ message: "Token generation failed", error: error.message });
  }
};
