import React, { useState } from "react";
import { useCharity } from "../hooks/useCharity";
import { ethers } from "ethers";

export default function Donate() {
  const { contract } = useCharity();
  const [campaignId, setCampaignId] = useState(1);
  const [amount, setAmount] = useState("");

  const donate = async () => {
    const tx = await contract.donate(campaignId, {
      value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    alert("Donation successful!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl">Donate</h2>
      <input
        type="number"
        placeholder="Campaign ID"
        value={campaignId}
        onChange={(e) => setCampaignId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={donate}>Donate</button>
    </div>
  );
}
