import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/lipaRoute";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to Mpesa Payment API");
});

app.use("/lipa", router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
