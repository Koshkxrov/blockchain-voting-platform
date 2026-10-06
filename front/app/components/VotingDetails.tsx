"use client";

import React from "react";
import { ethers } from "ethers";
import { useBlockchain } from "../providers"; // Ваш контекст, где есть signer
import { motion } from "framer-motion";

/**
 * Компонент для отображения результатов голосования (прогресс-бар и т.д.).
 */
interface VotingOptionsProps {
  isEnded: boolean;
  results: number[];
}

const VotingOptions: React.FC<VotingOptionsProps> = ({ isEnded, results }) => {
  const totalVotes = results.reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Результаты голосования</h2>
      {results.map((count, index) => {
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Вариант {index + 1}</span>
              <span>
                {count} голосов ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * ABI и адрес контракта — укажите свои реальные значения.
 */
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  "function getVotingInfo(uint256) view returns (string,bool,bool,bool,uint256,bool)",
  "function vote(uint256,uint256,string,string) external",
  "function endVoting(uint256) external",
  "function getVotingResults(uint256) view returns (uint256[])"
];

/** Входные пропсы для страницы деталей */
interface VotingDetailsProps {
  votingId: string;
}

/** Структура, которую возвращает getVotingInfo */
interface VotingState {
  name: string;
  isPublic: boolean;
  isEducational: boolean;
  hasNFT: boolean;
  endTime: number;
  isEnded: boolean;
}

/**
 * Основной компонент "VotingDetails".
 * Вызывает контракт, получает инфу о голосовании,
 * даёт возможность проголосовать и завершить.
 */
export default function VotingDetails({ votingId }: VotingDetailsProps) {
  const { signer } = useBlockchain();

  const [loading, setLoading] = React.useState(false);
  const [voting, setVoting] = React.useState<VotingState | null>(null);
  const [results, setResults] = React.useState<number[] | null>(null);

  const [selectedOption, setSelectedOption] = React.useState(1);
  const [userEmail, setUserEmail] = React.useState("");

  /**
   * Загружаем инфу о голосовании
   */
  const loadVotingInfo = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // getVotingInfo возвращает 6 значений:
      // (name, isPublic, isEducational, hasNFT, endTime, isEnded)
      const info = await contract.getVotingInfo(votingId);

      const data: VotingState = {
        name: info[0],
        isPublic: info[1],
        isEducational: info[2],
        hasNFT: info[3],
        endTime: Number(info[4]),
        isEnded: info[5]
      };
      setVoting(data);

      // Если уже завершено, подгружаем результаты
      if (data.isEnded) {
        const arr: number[] = await contract.getVotingResults(votingId);
        setResults(arr.map(Number));
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Ошибка при загрузке информации:", error);
    }
    setLoading(false);
  };

  /**
   * Отправка голоса
   */
  const handleVote = async () => {
    if (!signer || !voting) return;
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // vote(uint256 votingId, uint256 option, string email, string reserved)
      const tx = await contract.vote(votingId, selectedOption, userEmail, "");
      await tx.wait();

      alert("Ваш голос успешно учтен!");
      loadVotingInfo(); // обновляем информацию
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
      alert("Ошибка при голосовании. Проверьте консоль.");
    }
  };

  /**
   * Завершение голосования
   */
  const handleEndVoting = async () => {
    if (!signer || !voting) return;
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.endVoting(votingId);
      await tx.wait();

      alert("Голосование завершено!");
      loadVotingInfo();
    } catch (error) {
      console.error("Ошибка при завершении голосования:", error);
      alert("Ошибка при завершении голосования. Проверьте консоль.");
    }
  };

  React.useEffect(() => {
    loadVotingInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, votingId]);

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }
  if (!voting) {
    return <div>Голосование не найдено</div>;
  }

  const ended = voting.isEnded;
  const endTimeStr = new Date(voting.endTime * 1000).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-soft"
    >
      {/* Заголовок */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-6 text-gray-800 text-center"
      >
        {voting.name}
      </motion.h1>

      {/* Блок с информацией: тип, категория, награда */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="p-4 bg-gradient-to-r from-primary-50 to-white rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Тип</p>
          <p className="font-medium text-gray-800">
            {voting.isPublic ? "Публичное" : "Приватное"}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-r from-primary-50 to-white rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Категория</p>
          <p className="font-medium text-gray-800">
            {voting.isEducational ? "Образовательное" : "Стандартное"}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-r from-primary-50 to-white rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Награда</p>
          <p className="font-medium text-gray-800">
            {voting.hasNFT ? "С NFT наградой" : "Без NFT"}
          </p>
        </div>
      </motion.div>

      {/* Дата окончания и статус */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-50 to-white rounded-lg mb-8"
      >
        <div>
          <p className="text-sm text-gray-500 mb-1">Завершение</p>
          <p className="font-medium text-gray-800">{endTimeStr}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Статус</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              ended
                ? "bg-gray-100 text-gray-800"
                : "bg-primary-100 text-primary-800"
            }`}
          >
            {ended ? "Завершено" : "Активно"}
          </span>
        </div>
      </motion.div>

      {/* Если не завершено — форма для голосования, иначе показываем результаты */}
      {!ended ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-800">
              Выберите вариант
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
            >
              <option value={1}>Вариант 1</option>
              <option value={2}>Вариант 2</option>
              <option value={3}>Вариант 3</option>
            </select>
          </div>

          {/* Поле email (обязательно, если образовательное — как в примере) */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-800">
              Email адрес
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVote}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-lg shadow-md hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform transition-all duration-200"
          >
            Проголосовать
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleEndVoting}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Завершить голосование
          </motion.button>
        </motion.div>
      ) : (
        // Если завершено — показываем результаты
        results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <VotingOptions isEnded={ended} results={results} />
          </motion.div>
        )
      )}
    </motion.div>
  );
}
