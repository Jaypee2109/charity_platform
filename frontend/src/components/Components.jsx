import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export function Donate({ contract }) {
  const [campaignId, setCampaignId] = useState("");
  const [amount, setAmount] = useState("");

  const handleDonate = async () => {
    if (!campaignId || !amount) {
      alert("Please enter both campaign ID and amount");
      return;
    }
    try {
      const id = parseInt(campaignId, 10);
      const tx = await contract.donate(id, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      alert(`Donated ${amount} ETH to campaign #${id}`);
    } catch (err) {
      console.error(err);
      alert("Donation failed");
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Donate</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          type="number"
          placeholder="Campaign ID"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        />
        <input
          className="mt-2 w-full p-2 border rounded"
          type="text"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button className="mt-2 w-full" onClick={handleDonate}>
          Donate
        </Button>
      </CardContent>
    </Card>
  );
}

export function CreateAuction({ contract }) {
  const [charityAddr, setCharityAddr] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreate = async () => {
    if (!charityAddr || !duration) {
      alert("Please enter charity address and duration");
      return;
    }
    try {
      const dur = parseInt(duration, 10);
      const tx = await contract.createAuction(charityAddr, dur);
      await tx.wait();
      alert(
        `Auction created for charity ${charityAddr} lasting ${duration} seconds`
      );
    } catch (err) {
      console.error(err);
      alert("Auction creation failed");
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Create Auction</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          type="text"
          placeholder="Charity Address"
          value={charityAddr}
          onChange={(e) => setCharityAddr(e.target.value)}
        />
        <input
          className="mt-2 w-full p-2 border rounded"
          type="number"
          placeholder="Duration (seconds)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Button className="mt-2 w-full" onClick={handleCreate}>
          Create Auction
        </Button>
      </CardContent>
    </Card>
  );
}

export function AuctionList({ contract }) {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    if (!contract) return;
    (async () => {
      const count = (await contract.auctionCount()).toNumber();
      const items = [];
      for (let id = 1; id <= count; id++) {
        const a = await contract.auctions(id);
        items.push({ id, ...a });
      }
      setAuctions(items);
    })();
  }, [contract]);

  return (
    <div className="col-span-2 grid gap-4">
      {auctions.map((a) => (
        <Card key={a.id}>
          <CardContent>
            <h3 className="font-semibold">Auction #{a.id}</h3>
            <p>Charity: {a.charity}</p>
            <p>Highest Bid: {ethers.utils.formatEther(a.highestBid)} ETH</p>
            <p>Highest Bidder: {a.highestBidder || "None"}</p>
            <p>
              Ends: {new Date(a.endTime.toNumber() * 1000).toLocaleString()}
            </p>
            {a.ended && <p className="text-green-600">✔ Auction Ended</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FinalizeAuction({ contract }) {
  const [auctionId, setAuctionId] = useState("");

  const handleFinalize = async () => {
    if (!auctionId) {
      alert("Please enter an auction ID");
      return;
    }
    try {
      const id = parseInt(auctionId, 10);
      const tx = await contract.endAuction(id);
      await tx.wait();
      alert(`Auction #${id} finalized!`);
    } catch (err) {
      console.error(err);
      alert("Finalization failed");
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Finalize Auction</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          type="number"
          placeholder="Auction ID"
          value={auctionId}
          onChange={(e) => setAuctionId(e.target.value)}
        />
        <Button className="mt-2 w-full" onClick={handleFinalize}>
          Finalize
        </Button>
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard({ contract }) {
  const [campaignId, setCampaignId] = useState("");
  const [metrics, setMetrics] = useState({
    total: "0",
    count: 0,
    highest: "0",
    average: "0",
  });

  useEffect(() => {
    if (!contract || !campaignId) return;
    (async () => {
      const id = parseInt(campaignId, 10);
      const [totalBN, countBN, highestBN, avgBN] =
        await contract.getCampaignMetrics(id);
      setMetrics({
        total: ethers.utils.formatEther(totalBN),
        count: countBN.toNumber(),
        highest: ethers.utils.formatEther(highestBN),
        average: ethers.utils.formatEther(avgBN),
      });
    })();
  }, [contract, campaignId]);

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Campaign Metrics</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          type="number"
          placeholder="Campaign ID"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        />
        {campaignId && (
          <div className="mt-4 space-y-1">
            <p>
              <strong>Total Donations:</strong> {metrics.total} ETH
            </p>
            <p>
              <strong>Donor Count:</strong> {metrics.count}
            </p>
            <p>
              <strong>Highest Donation:</strong> {metrics.highest} ETH
            </p>
            <p>
              <strong>Average Donation:</strong> {metrics.average} ETH
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CreateCampaign({ contract }) {
  const [charityAddr, setCharityAddr] = useState("");

  const handleCreate = async () => {
    if (!charityAddr) {
      alert("Enter a charity address");
      return;
    }
    try {
      const tx = await contract.createCampaign(charityAddr);
      await tx.wait();
      alert(`Campaign created for ${charityAddr}`);
    } catch (err) {
      console.error(err);
      alert("Campaign creation failed");
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Create Campaign</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          type="text"
          placeholder="Charity Address"
          value={charityAddr}
          onChange={(e) => setCharityAddr(e.target.value)}
        />
        <Button className="mt-2 w-full" onClick={handleCreate}>
          Create Campaign
        </Button>
      </CardContent>
    </Card>
  );
}

export function PlaceBid({ contract }) {
  const [auctionId, setAuctionId] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  const handleBid = async () => {
    if (!auctionId || !bidAmount) {
      alert("Enter auction ID and bid amount");
      return;
    }
    try {
      const id = parseInt(auctionId, 10);
      const tx = await contract.bid(id, {
        value: ethers.utils.parseEther(bidAmount),
      });
      await tx.wait();
      alert(`Bid of ${bidAmount} ETH placed on auction #${id}`);
    } catch (err) {
      console.error(err);
      alert("Bid failed");
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Place Bid</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          type="number"
          placeholder="Auction ID"
          value={auctionId}
          onChange={(e) => setAuctionId(e.target.value)}
        />
        <input
          className="mt-2 w-full p-2 border rounded"
          type="text"
          placeholder="Bid Amount (ETH)"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
        />
        <Button className="mt-2 w-full" onClick={handleBid}>
          Place Bid
        </Button>
      </CardContent>
    </Card>
  );
}
