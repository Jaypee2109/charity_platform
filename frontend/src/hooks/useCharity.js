import { useState, useEffect } from "react";
import { ethers } from "ethers";
import CharityABI from "../abi/Charity.json";

export function useCharity() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(p);
      p.send("eth_requestAccounts", []).then(() => {
        const s = p.getSigner();
        setSigner(s);
        setContract(
          new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            CharityABI,
            s
          )
        );
      });
    }
  }, []);

  return { provider, signer, contract };
}
