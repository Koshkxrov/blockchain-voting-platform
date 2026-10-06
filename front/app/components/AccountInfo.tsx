"use client";

import React from "react";
import { useBlockchain } from "../providers";
import { ethers } from "ethers";

export default function AccountInfo() {
  const { signer } = useBlockchain();
  const [address, setAddress] = React.useState<string>("");
  const [balance, setBalance] = React.useState<string>("");

  React.useEffect(() => {
    async function loadAccountInfo() {
      if (!signer) return;
      try {
        const addr = await signer.getAddress();
        const bal = await signer.provider.getBalance(addr);
        setAddress(addr);
        setBalance(ethers.formatEther(bal));
      } catch (error) {
        console.error("Error loading account info:", error);
      }
    }
    loadAccountInfo();
  }, [signer]);

  if (!signer || !address) return null;

  return (
    <div className="text-sm text-gray-600">
      <p className="mb-1">
        Адрес: {address.slice(0, 6)}...{address.slice(-4)}
      </p>
      <p>Баланс: {parseFloat(balance).toFixed(4)} ETH</p>
    </div>
  );
}
