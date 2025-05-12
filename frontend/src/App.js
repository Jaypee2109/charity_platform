import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// UI components
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";

// Your feature components
import {
  Donate,
  CreateAuction,
  AuctionList,
  FinalizeAuction,
  MetricsDashboard,
  PlaceBid,
  CreateCampaign,
} from "./components/Components";

// ABI + address
import artifact from "./contracts/Charity.json";
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export default function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      if (!window.ethereum) {
        setError("MetaMask not detected. Please install it and refresh.");
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Prompt user to connect their wallet
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const acct = await signer.getAddress();
        const net = await provider.getNetwork();

        // Instantiate contract
        const ctr = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);

        setAccount(acct);
        setNetwork(net);
        setContract(ctr);

        console.log("Connected to contract at", ctr.address);
        signer.getChainId().then((id) => console.log("On chainId", id));
      } catch (err) {
        console.error(err);
        setError("Failed to connect wallet or load contract.");
      }
    }
    init();
  }, []);

  // Display errors (e.g. no MetaMask, bad address)
  if (error) {
    return (
      <div className="p-4 text-red-600">
        <Card>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Waiting on user to connect & contract to load
  if (!contract) {
    return (
      <div className="p-4">
        <Card>
          <CardContent>Connecting to walletâ€¦</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Campaign management */}
      <CreateCampaign contract={contract} />

      {/* Donation form */}
      <Donate contract={contract} account={account} />

      {/* Create a new timed auction */}
      <CreateAuction contract={contract} account={account} />

      {/* List all auctions */}
      <AuctionList contract={contract} account={account} />

      {/* Real-time bidding */}
      <PlaceBid contract={contract} />

      {/* End an auction manually */}
      <FinalizeAuction contract={contract} account={account} />

      {/* Metrics dashboard for campaigns */}
      <MetricsDashboard contract={contract} account={account} />
    </div>
  );
}
