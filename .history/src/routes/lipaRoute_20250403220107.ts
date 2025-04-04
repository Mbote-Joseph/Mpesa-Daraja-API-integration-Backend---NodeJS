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

import express from "express";
import { handleStkPush } from "../controllers/stkController";
import { generateToken } from "../middlewares/generateToken";
import { checkPaymentStatus, handleMpesaCallback } from "../controllers/mpesaCallbackController";

const router = express.Router();

router.post("/stkpush", generateToken, handleStkPush);
router.post("/callback", handleMpesaCallback);
router.get("/status", checkPaymentStatus);

export default router;
