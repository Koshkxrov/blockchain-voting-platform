"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useBlockchain } from "../providers";
import Link from "next/link";
import { motion } from "framer-motion";
import { CONTRACT_ABI } from '../constants/contractABI';
import { toast } from "react-hot-toast";
import { fadeIn, staggerChildren } from '../utils/animations';

interface Voting {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  options: string[];
  endTime: number;
  isEnded: boolean;
  totalVotes: number;
}

export default function VotingList() {
  const { provider } = useBlockchain();
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotings = async () => {
      if (!provider) {
        setError("Blockchain provider not available");
        setLoading(false);
        return;
      }

      try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddress) {
          throw new Error("Contract address not configured");
        }

        const contract = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          provider
        );

        const count = await contract.getVotingCount();
        const votingPromises = [];

        for (let i = 0; i < count; i++) {
          votingPromises.push(contract.getVotingInfo(i));
        }

        const votingsData = await Promise.all(votingPromises);
        const formattedVotings = votingsData.map((voting, index) => ({
          id: index,
          name: voting.name,
          description: voting.description,
          isPublic: !voting.isPrivate,
          options: voting.options,
          endTime: voting.endTime.toNumber(),
          isEnded: voting.isEnded,
          totalVotes: voting.totalVotes.toNumber(),
        }));

        setVotings(formattedVotings);
        setError(null);
      } catch (err) {
        console.error("Error fetching votings:", err);
        setError("Failed to load votings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVotings();
  }, [provider]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (votings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No votings found. Create one to get started!
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="max-w-4xl mx-auto px-4"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Voting List
        </h1>
        <Link
          href="/votings/create"
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <motion.span
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Create Voting</span>
          </motion.span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid gap-6"
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {votings.map((voting, index) => (
            <motion.div
              key={voting.id}
              variants={fadeIn}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <Link href={`/votings/${voting.id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                        {voting.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {voting.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            voting.isPublic
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {voting.isPublic ? "Public" : "Private"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {voting.options.length} Options
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          voting.isEnded
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                        }`}
                      >
                        {voting.isEnded ? "Ended" : "Active"}
                      </span>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Ends: {new Date(voting.endTime * 1000).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Votes: {voting.totalVotes}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
