import { web3 } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import csv from "csv-parser";
import fastcsv from "fast-csv";
import fs from "fs";
import pkg from "bs58";
const { decode } = pkg;

class Service {
  constructor() {
    this.web3 = null;
  }

  toCluster(cluster) {
    switch (cluster) {
      case "devnet":
      case "testnet":
      case "mainnet-beta": {
        return cluster;
      }
    }
    throw new Error("Invalid cluster provided.");
  }

  saveUserAddress = async (receiver) => {
    const dataObj = [{ address: receiver }];
    const csvFile = fs.createWriteStream("./src/files/airdrop.csv", {
      flags: "a",
    });
    csvFile.write("\n");
    fastcsv
      .writeToStream(csvFile, dataObj, { headers: false })
      .on("finish", () => {
        return;
      });
  };

  sendSPLTransaction = async () => {
    let cluster = "devnet";
    let url = web3.clusterApiUrl(this.toCluster(cluster), true);
    let connection = new web3.Connection(url, "processed");

    // please replace secret key
    let SECRET_KEY = process.env.SECRET_KEY;
    const Uin8bytes = decode(SECRET_KEY);
    const fromWallet = web3.Keypair.fromSecretKey(Uint8Array.from(Uin8bytes));
    const tokenMintAddress = process.env.TOKEN_ADDRESS;

    fs.createReadStream("./src/files/airdrop.csv")
      .pipe(csv())
      .on("data", async (row) => {
        console.log(row?.address);
        const to = new web3.PublicKey(row?.address);
        await this.tokenTransfer(
          tokenMintAddress,
          fromWallet,
          to,
          connection,
          50
        );
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
      });
  };

  tokenTransfer = async (tokenMintAddress, wallet, to, connection, amounts) => {
    const mintPublicKey = new web3.PublicKey(tokenMintAddress);
    const mintToken = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      wallet
    );
    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
      wallet.publicKey
    );
    let instructions = [];

    const dest = to;
    const destPublicKey = new web3.PublicKey(dest);
    // const associatedDestinationTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(destPublicKey)
    const associatedDestinationTokenAddr =
      await Token.getAssociatedTokenAddress(
        mintToken.associatedProgramId,
        mintToken.programId,
        mintPublicKey,
        destPublicKey
      );
    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );
    if (receiverAccount === null) {
      instructions.push(
        Token.createAssociatedTokenAccountInstruction(
          mintToken.associatedProgramId,
          mintToken.programId,
          mintPublicKey,
          associatedDestinationTokenAddr,
          destPublicKey,
          wallet.publicKey
        )
      );
    }
    instructions.push(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        associatedDestinationTokenAddr,
        wallet.publicKey,
        [],
        amounts * 10 ** 6
      )
    );
    const transaction = new web3.Transaction().add(...instructions);
    var signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet]
    );
    console.log("SIGNATURE", signature);
    console.log("SUCCESS");

    return signature;
  };
}

export default new Service();
