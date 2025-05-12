import React, { useState } from "react";
import { useCharity } from "../hooks/useCharity";
import { ethers } from "ethers";

export default function Auction() {
  const { contract } = useCharity();
  const [duration, setDuration] = useState(60);
  const [bidAmount, setBidAmount] = useState("");
  const [auctionId, setAuctionId] = useState(1);

  const create = async () => {
    const tx = await contract.createAuction(
      process.env.REACT_APP_CONTRACT_ADDRESS,
      duration
    );
    await tx.wait();
    alert("Auction created!");
  };

  const bid = async () => {
    const tx = await contract.bid(auctionId, {
      value: ethers.utils.parseEther(bidAmount),
    });
    await tx.wait();
    alert("Bid placed!");
  };

  const end = async () => {
    const tx = await contract.endAuction(auctionId);
    await tx.wait();
    alert("Auction ended!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl">Auction</h2>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (s)"
      />
      <button onClick={create}>Create Auction</button>
      <hr />
      <input
        type="number"
        value={auctionId}
        onChange={(e) => setAuctionId(e.target.value)}
        placeholder="Auction ID"
      />
      <input
        type="text"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Bid Amount (ETH)"
      />
      <button onClick={bid}>Place Bid</button>
      <button onClick={end}>End Auction</button>
    </div>
  );
}
