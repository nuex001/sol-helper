import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Buffer } from "buffer";

// Import wallet adapters
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { TrustWalletAdapter } from "@solana/wallet-adapter-trust";
import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-coinbase";

window.Buffer = Buffer;

export const SolanaProvider = ({ children }) => {
  const endpoint = useMemo(
    () =>
      `https://rpc.helius.xyz/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`,
    []
  );

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <SolanaProvider>
    <App />
  </SolanaProvider>
);