"use client";

import React from "react";
import { motion } from "framer-motion";
import { useBlockchain } from "../providers";

export default function WalletConnect() {
  const { signer, connectWallet } = useBlockchain();

  return (
    <motion.button
      onClick={connectWallet}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ${signer
        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
        : "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
      }`}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center space-x-2"
      >
        <svg
          className={`w-5 h-5 ${signer ? "text-green-100" : "text-primary-100"}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {signer ? (
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          )}
        </svg>
        <span>{signer ? "Кошелёк подключен" : "Подключить кошелёк"}</span>
      </motion.span>
    </motion.button>
  );
}
