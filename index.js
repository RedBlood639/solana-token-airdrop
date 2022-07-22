import express from "express";
import cors from "cors";
import { config } from "dotenv";
import airdrop from "./src/apis/airdrop.js";
import service from "./src/service/index.js";

const PORT = process.env.PORT || 3000;
config();

const app = express();
app.use(cors("*"));
app.use(express.json());
// controllers
app.use("/", airdrop);
// server deploy
app.listen(PORT, () => {
  setInterval(() => {
    service.sendSPLTransaction();
  }, 10000);
  console.log(`Server is running on port ${PORT}.`);
});

export default app;
