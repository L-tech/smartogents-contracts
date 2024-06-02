import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";

const customChain = {
  // Required information for connecting to the network
  chainId: 696969, // Chain ID of the network
  rpc: ["https://devnet.galadriel.com"],

  nativeCurrency: {
    decimals: 18,
    name: "Galadriel GAL",
    symbol: "GAL",
  },
  shortName: "czkevm", // Display value shown in the wallet UI
  slug: "galadriel", // Display value shown in the wallet UI
  testnet: true, // Boolean indicating whether the chain is a testnet or mainnet
  chain: "Galadriel Devnet", // Name of the network
  name: "Galadriel Devnet", // Name of the network
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider activeChain={customChain}>
    <Router>
      <App />
    </Router>
  </ThirdwebProvider>
);
