import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import airdrop from "./src/apis/airdrop.js";

config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/airdrop", airdrop);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

export default app;
