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
     const serializedTx = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAA4dVhUxzbYWhzUoW8op2eRj1dsbBkoz4M807VJKUpSFVioUDAnDiGwcaoRPMpMbzwSqwxeFGbHA/lPU/ypxDrTePCKSLlsIo0UcAWc6WTxmHArMH/YsAfNBhtgm8ff1qdHKOgcUmqUPPcxJbv6RJ7ytENRs/OsJaAlCNjnTap5cVIw/5siFVkiDRVOAxsccPPXXqGE95yQKx6q4gZpc8m0c9lLq45lPzh1wpDQkpfMFsbLqJauu2fyqBFWAuH5o6u4JnSB81fV/SrruUujHysUb+VoQ+ChwBQG2RudWZarR4WqqkP1Lj6G4GGInA4tCB/TOJQGmK7KYUgalOfZND8ib3+AU2LRAXylyujF7q7PfBjFLyLL34eEZ2P9HFom2COZz6+3AtZeSiwhw9lsMkuIszctQj9PV5ciVHiYwT+pBPO3t8bb6Ife3mBYa2q+/aRIB668TE/bopd4zp4RSn/mvPvHNd/W2rYk7Ka10Z5GMAvenzdI1nESFWsAlmvXULNw1BHgxJgcvQqnNZq3RjRuHuzEL9YMLzPVfai3xfAEc1AwMH3WJACrMqmfJDtuARdJUVI1/MSRV9afrx+oQWLTuTA5Ig05L1hIsKKQRxE8YtMGKVeLWEeisdOCXu89kbJygAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WQMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAAsnDWf6mMUc8CEwUTWJYrrzV0K+1ZydlEXpwNDIXHzZG0P/on9df2SnTAmx8pWHneSwmrNt/J3VFLMhqns4zl6LYNyUUlvKL50j2zodlvpiQvg2vo9s63G91VKFoADQT/xvp6877brTo9ZfNqq8l0MbG75MLS9uDkfKYCA0UvXWHUKECzHcxG1IDLaPhNpk//K/8inSQSrfy5FmAW9bnb/goyk21h/qbYtgbnBsKhdLFrZ6WCSw/Uran4atTNmGV+BHnVW/IxwG7udMVuzmgVB/2xst6j9I5RArHNola8E48E6eEvvIToJskyzOniZAzOFVkMHGJzsJJXCLo7hSCwvAabiFf+q4GE+2h/Y0YYwDXaxDncGus7VZig8AAAAAABBqfVFxh70WY12tQEVf3CwMEkxo8hVnWl27rLXwgAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqSPZvldmHrANox8iHGY3KVjf/xdb1BN4xt53yuoDF7NQBREABQLAXBUAEQAJAwQXAQAAAAAAEAYAAgAaDxwBARgpHAEABAcKAhQaGBgTGBkFGQsGBwwUFQgZARwcEhkOGBcBAwoMDQkWGxwqwSCbM0HWnIEBAgAAACZkAAFWAf5kAQJYAgAAAAAAAA8AAAAAAAAAMgAAHAMCAAABCQ==";

      // Step 4: Deserialize and prepare main transaction
      const transactionBytes = Buffer.from(serializedTx, "base64");

      const transaction = VersionedTransaction.deserialize(transactionBytes);
      // console.log(transaction);
      // console.log("signatures before signing:", transaction.signatures);

      // const { blockhash } = await connection.getLatestBlockhash("confirmed");
      // console.log(blockhash);

      // transaction.message.recentBlockhash = blockhash;
      // 3. Sign with wallet
      const signedTx = await signTransaction(transaction);

      console.log("Confirming transaction...");

      // 4. Send to network
      const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      console.log("completed");
 } catch (error) {
  console.log(error);
  
 }
      
  };

const getVerifiedTokenList = async () => {
  try {
    console.log("Fetching Raydium token list...");
    
    // Raydium's official token list
  const url = 'https://lite-api.jup.ag/tokens/v2/tag?query=verified';
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


   useEffect(() => {
    console.log(status);
  }, [status]);
  //
  useEffect(() => {
    if (connected) {
      // console.log(connected);
      // getVerifiedTokenList(); ///comment this out to get the number of tokens verified tokens
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
