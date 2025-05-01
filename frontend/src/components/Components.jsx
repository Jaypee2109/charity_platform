import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AuctionList({ contract }) {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    if (!contract) return;
    async function fetchAuctions() {
      const countBN = await contract.auctionCount();
      const count = countBN.toNumber();
      const items = [];
      for (let i = 0; i < count; i++) {
        const a = await contract.auctions(i);
        items.push({ id: i, ...a });
      }
      setAuctions(items);
    }
    fetchAuctions();
  }, [contract]);

  return (
    <div className="col-span-2 grid gap-4">
      {auctions.map(a => (
        <Card key={a.id}>
          <CardContent>
            <h3 className="font-semibold">Auction #{a.id}</h3>
            <p>Charity: {a.charity}</p>
            <p>Highest Bid: {ethers.utils.formatEther(a.highestBid || 0)} ETH</p>
            <p>Highest Bidder: {a.highestBidder || 'None'}</p>
            <p>Ends: {new Date(a.endTime.toNumber() * 1000).toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FinalizeAuction({ contract }) {
  const [auctionId, setAuctionId] = useState('');

  async function handleFinalize() {
    if (!auctionId) return;
    const tx = await contract.finalizeAuction(auctionId);
    await tx.wait();
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">Finalize Auction</h2>
        <input
          className="mt-2 w-full p-2 border rounded"
          placeholder="Auction ID"
          value={auctionId}
          onChange={e => setAuctionId(e.target.value)}
        />
        <Button className="mt-2" onClick={handleFinalize}>Finalize</Button>
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard({ contract, account }) {
  const [donorMetrics, setDonorMetrics] = useState({ total: '0', count: 0 });
  const [charityMetrics, setCharityMetrics] = useState({ total: '0', count: 0 });

  useEffect(() => {
    if (!contract || !account) return;
    async function fetchMetrics() {
      const [donTotalBN, donCountBN] = await contract.getDonorMetrics(account);
      const [charTotalBN, charCountBN] = await contract.getCharityMetrics(account);
      setDonorMetrics({
        total: ethers.utils.formatEther(donTotalBN),
        count: donCountBN.toNumber(),
      });
      setCharityMetrics({
        total: ethers.utils.formatEther(charTotalBN),
        count: charCountBN.toNumber(),
      });
    }
    fetchMetrics();
  }, [contract, account]);

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-bold">My Metrics</h2>
        <p><strong>As Donor:</strong> {donorMetrics.count} donations, {donorMetrics.total} ETH</p>
        <p><strong>As Charity:</strong> {charityMetrics.count} donations, {charityMetrics.total} ETH</p>
      </CardContent>
    </Card>
  );
}
