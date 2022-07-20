import express from "express";
const airdrop = express.Router();
import service from "../service/index.js";

airdrop.post("/", async (req, res) => {
  const { receiver } = req.body;
  let signature = await service.sendSPLTransaction(receiver);
  return res.send({ signature });
});

export default airdrop;
