import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from 'bs58';

function App() {
  const {
    publicKey,
    signMessage,
    signTransaction,
    sendTransaction,
    connected,
  } = useWallet();
   const { connection } = useConnection();

  const [status, setStatus] = useState("");

  const handleSignMessage = async () => {
    if (!connected) { //if it's not connected, then return
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
    console.log("Signed Message (hex):", Buffer.from(signature).toString("hex"));

    setStatus("Message signed successfully!");
    } catch (error) {
      console.log(error);
      
      setStatus(`Error: ${error.message}`);
    }
  };

//   // 
//   const handleTokenTransfer = async () => {
//   if (!publicKey || !sendTransaction) {
//     setStatus("Please connect your wallet first");
//     return;
//   }

//   try {
//     setStatus("Preparing token transfer...");

//     const tokenMint = new PublicKey("YOUR_TOKEN_MINT_ADDRESS");
//     const recipient = new PublicKey("RECIPIENT_ADDRESS");
//     const amount = 10 * 10 ** 6; // for 6 decimals tokens, adjust as needed

//     // Find associated token accounts
//     const senderTokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);
//     const recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, recipient);

//     // Create transaction
//     const transaction = new Transaction().add(
//       createTransferInstruction(
//         senderTokenAccount,
//         recipientTokenAccount,
//         publicKey,
//         amount,
//         [],
//         TOKEN_PROGRAM_ID
//       )
//     );

//     // Send and confirm
//     const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
//     transaction.recentBlockhash = blockhash;
//     transaction.feePayer = publicKey;

//     const signature = await sendTransaction(transaction, connection);

//     await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

//     setStatus(`Token transfer successful! Signature: ${signature}`);
//   } catch (error) {
//     console.error(error);
//     setStatus(`Token transfer failed: ${error.message}`);
//   }
// };

  //
  useEffect(() => {
    console.log(status);
  }, [status]);
  //
  useEffect(() => {
    if (connected) {
      // console.log(connected);
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
        <button onClick={handleSignMessage} style={{ marginLeft: "1rem" }}>
          Sign Message
        </button>
        <button onClick={handleTransfer} style={{ marginLeft: "1rem" }}>
          Transfer
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
