import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/lipaRoute";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("M-Pesa Daraja STK Push API is live");
});

app.use("/lipa", router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
