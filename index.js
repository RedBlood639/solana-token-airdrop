import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import airdrop from "./src/apis/airdrop.js";

config();

const app = express();

const allowedOrigins = ["https://spl-airdrop.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(origin);
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", (req, res) => {
  res.send("test here");
});
app.use("/api/airdrop", airdrop);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

export default app;
