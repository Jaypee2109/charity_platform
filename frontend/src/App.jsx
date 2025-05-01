import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuctionList, FinalizeAuction, MetricsDashboard } from './components/Components';

// TODO: Replace with deployed contract ABI and address
import DecentralizedCharityABI from '../contracts/DecentralizedCharity.json';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const prov = new ethers.providers.Web3Provider(window.ethereum);
        await prov.send('eth_requestAccounts', []);
        const sign = prov.getSigner();
        const acct = await sign.getAddress();
        const ctr = new ethers.Contract(CONTRACT_ADDRESS, DecentralizedCharityABI, sign);
        setProvider(prov);
        setSigner(sign);
        setAccount(acct);
        setContract(ctr);
      }
    }
    init();
  }, []);

  if (!contract) return <div className="p-4">Connecting to Wallet...</div>;

  return (
    <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <AuctionList contract={contract} />
      <FinalizeAuction contract={contract} />
      <MetricsDashboard contract={contract} account={account} />
    </div>
  );
}
