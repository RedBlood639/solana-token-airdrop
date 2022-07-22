import express from "express";
const airdrop = express.Router();
import service from "../service/index.js";

airdrop.post("/", async (req, res) => {
  const { receiver } = req.body;
  try {
    await service.saveUserAddress(receiver);
    res.status(200).send("success.");
  } catch (e) {
    res.status(400).send("error happened.");
  }
});

export default airdrop;
