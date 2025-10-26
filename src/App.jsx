import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  WalletMultiButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import axios from "axios";

function App() {
  const {
    publicKey,
    signMessage,
    signTransaction,
    sendTransaction,
    connected,
  } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal(); //for connect and disconnect
  const [status, setStatus] = useState("");

  const handleSignMessage = async () => {
    if (!connected) {
      //if it's not connected, then return
      setStatus("Please connect your wallet first");
      return;
    }

    try {
      setStatus("Signing message...");
      const encodedMessage = new TextEncoder().encode(
        "Please sign this message to authenticate: 576428"
      ); // we encode the message
      const signature = await signMessage(encodedMessage); //signs the message

      // Convert to base58 (proper Solana format)
      const signatureBase58 = bs58.encode(signature);

      // Log both formats
      console.log("Signed Message (base58):", signatureBase58); //this is the on you are going to send back to the verify endpoint
      console.log(
        "Signed Message (hex):",
        Buffer.from(signature).toString("hex")
      );

      setStatus("Message signed successfully!");
    } catch (error) {
      console.log(error);

      setStatus(`Error: ${error.message}`);
    }
  };

  // 🪄 Handle connect popup
  const handleConnectClick = async () => {
    try {
      setVisible(true); // opens the wallet selection popup
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  // ❌ Handle disconnect with popup confirm
  const signDeposit = async () => {
    try {
      //get
      const serializedTx =
        "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEEfqzyImFeawYws/3t3NIBGm7eHot3OIK+BfXQ7BQE7piX2TGJccCR9oDRW9eGqgxN086so9A9C2oYYWuOYlmBechIOzKZUV5DGrqe9hKavfMudMA6stMh7Z4Ux4DKkBgCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACiQtHXrV9S5Std1+kA02a82KKGLNxl1fV4V/pCzZ9ehwIDAgACDAIAAADwSQIAAAAAAAMCAAEMAgAAANB8KwAAAAAA";

      // Step 4: Deserialize and prepare main transaction
      const transactionBytes = Buffer.from(serializedTx, "base64");

      const transaction = VersionedTransaction.deserialize(transactionBytes);
      // console.log(transaction);
      // 3. Sign with wallet
      const signedTx = await signTransaction(transaction); //

      console.log("Confirming transaction...");

      // 4. Send to network
      const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      console.log(txId);

      //post //
      //tokenamount, sol output, the token name,
      console.log("completed and waiting for the transaction details");

      // 🔥 GET NETWORK FEE
      // Wait for confirmation first
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: txId,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      // Fetch transaction details to get the fee
      const txDetails = await connection.getTransaction(txId, {
        maxSupportedTransactionVersion: 0,
      });

      if (txDetails && txDetails.meta) {
        const fee = txDetails.meta.fee;
        console.log("Network Fee:", fee, "lamports");
        console.log("Network Fee:", fee / 1e9, "SOL");

        const result = { hash: txId, fee: fee, feeInSOL: fee / 1e9 };

        console.log(result);
        console.log("Transaction completed");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVerifiedTokenList = async () => {
    try {
      console.log("Fetching Raydium token list...");

      // Raydium's official token list
      const url = "https://lite-api.jup.ag/tokens/v2/tag?query=verified";
      const response = await axios.get(url);
      const verifiedTokens = response.data; // Array of token objects
      console.log(`Found ${verifiedTokens.length} verified tokens`);
      console.log(verifiedTokens); //we will be needing the icon as image and the id as the token address or mint address, also symbol
      //you can choose to use all or just 100 or more.

      return verifiedTokens;
    } catch (error) {
      console.error("Error fetching Raydium tokens:", error);
      return [];
    }
  };
  
  const getUserBalance = async () => {
    try {
      const lamports = await connection.getBalance(publicKey);
      console.log(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  /**
   * let solAmount = 2.5; // 2.5 SOL
let lamports = solAmount * 10**9; // 2,500,000,000 lamports

https://solscan.io/tx/2SeoG454EXZSy4Bm8AUQAFqkoENGbMbUN2YJqQF8Cqzk6A2hhxDqfPM8e7DneSWG5nkMTbz1ptzY4BXGfYB2qvJk?cluster=devnet
   */

  useEffect(() => {
    console.log(status);
  }, [status]);
  //
  useEffect(() => {
    if (connected) {
      // console.log(connected);
      // getVerifiedTokenList(); ///comment this out to get the number of tokens verified tokens
      // getUserBalance(); ///get user balance
    } else {
      console.log("Connect wallet");
    }
  }, [connected]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <WalletMultiButton />
        {/* CUSTOMIZED BUTTON */}
        {/* <WalletMultiButton>
          <button className="custom-btn">
            {connected ? "Disconnect" : "Connect"}
          </button>
        </WalletMultiButton> */}
        <button onClick={handleSignMessage} style={{ marginLeft: "1rem" }}>
          Sign Message
        </button>
        <button onClick={signDeposit} style={{ marginLeft: "1rem" }}>
          Deposit
        </button>

        {/* <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p> */}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
