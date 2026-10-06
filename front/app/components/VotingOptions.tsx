"use client";

import React from "react";
import { motion } from "framer-motion";

interface VotingOptionsProps {
  isEnded: boolean;
  results?: number[];
  onVote: (option: number) => void;
}

export default function VotingOptions({
  isEnded,
  results,
  onVote
}: VotingOptionsProps) {
  const [selectedOption, setSelectedOption] = React.useState(0);

  const handleVote = () => {
    onVote(selectedOption);
  };

  if (isEnded && results) {
    const total = results.reduce((a, b) => a + b, 0);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 p-6 bg-white rounded-xl shadow-soft"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Результаты голосования
        </h2>
        {results.map((votes, index) => {
          const percentage = total > 0 ? (votes / total) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Вариант {index + 1}</span>
                <span>{votes} голосов ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите вариант
        </label>
        <div className="space-y-2">
          {[0, 1].map((option) => (
            <label
              key={option}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                value={option}
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
                className="form-radio text-blue-600"
              />
              <span>Вариант {option + 1}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={handleVote}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Проголосовать
      </button>
    </div>
  );
}
