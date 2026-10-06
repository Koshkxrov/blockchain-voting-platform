"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { CONTRACT_ABI } from '../constants/contractABI';
import { Button } from './Button';

interface FormData {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  options: string[];
  allowedEmails: string[];
}

export default function CreateVotingForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    isPublic: true,
    options: ["", ""], // Минимум 2 опции
    allowedEmails: [], // Список разрешенных email для приватного голосования
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return {
        ...prev,
        options: newOptions,
      };
    });
  };

  const handleEmailChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newEmails = [...prev.allowedEmails];
      newEmails[index] = value;
      return {
        ...prev,
        allowedEmails: newEmails,
      };
    });
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const addEmail = () => {
    setFormData((prev) => ({
      ...prev,
      allowedEmails: [...prev.allowedEmails, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const removeEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter((_, i) => i !== index),
    }));
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Валидация формы
      if (!formData.name.trim()) throw new Error("Name is required");
      if (!formData.description.trim()) throw new Error("Description is required");
      if (!formData.startTime) throw new Error("Start time is required");
      if (!formData.endTime) throw new Error("End time is required");

      // Validate that start time is at least 5 minutes in the future
      const now = Math.floor(Date.now() / 1000);
      const selectedStartTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
      if (selectedStartTime - now < 300) {
        throw new Error("Start time must be at least 5 minutes in the future");
      }

      // Валидация опций
      const validOptions = formData.options.filter(opt => opt.trim() !== "");
      if (validOptions.length < 2) {
        throw new Error("At least 2 non-empty options are required");
      }

      // Валидация email для приватного голосования
      if (!formData.isPublic) {
        const validEmails = formData.allowedEmails.filter(email => email.trim() !== "");
        if (validEmails.length === 0) {
          throw new Error("Private voting requires at least one email");
        }

        const invalidEmails = validEmails.filter(email => !validateEmail(email));
        if (invalidEmails.length > 0) {
          throw new Error("Invalid email format detected");
        }
      }

      // Конвертация времени в Unix timestamp с учетом часового пояса
      const BUFFER_SECONDS = 300; // Increase buffer to 5 minutes to account for network delays and time differences
      const startTimeUnix = Math.floor(new Date(formData.startTime).getTime() / 1000) + BUFFER_SECONDS;
      const endTimeUnix = Math.floor(new Date(formData.endTime).getTime() / 1000);

      // Ensure end time is after start time including buffer
      if (endTimeUnix <= startTimeUnix) {
        throw new Error("End time must be after start time (including 5-minute buffer)");
      }

      console.log('Form timestamps:', {
        startTime: formData.startTime,
        endTime: formData.endTime,
        startTimeUnix,
        endTimeUnix,
        now: Math.floor(Date.now() / 1000)
      });

      // Создание объекта для отправки
      const votingData = {
        name: formData.name,
        description: formData.description,
        startTime: startTimeUnix,
        endTime: endTimeUnix,
        options: formData.options.filter(opt => opt.trim() !== ""),
        isPublic: formData.isPublic,
        allowedEmails: formData.isPublic ? [] : formData.allowedEmails.filter(email => email.trim() !== "")
      };

      const response = await fetch("/api/votings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(votingData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create voting");
      }

      toast.success("Voting created successfully!");
      router.push("/votings");
    } catch (err) {
      console.error("Error creating voting:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create voting";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={formAnimation}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemAnimation}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="Enter voting name"
          />
        </motion.div>

        <motion.div variants={itemAnimation}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            placeholder="Enter voting description"
          />
        </motion.div>

        <motion.div variants={itemAnimation}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
          />
        </motion.div>

        <motion.div variants={itemAnimation}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
          />
        </motion.div>

        <motion.div variants={itemAnimation}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Voting Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="votingType"
                checked={formData.isPublic}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Public Voting
              </span>
            </label>
            <label className="flex items-center space-x-3 opacity-50 cursor-not-allowed">
              <input
                type="radio"
                name="votingType"
                checked={!formData.isPublic}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                disabled
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Private Voting (Coming Soon)
              </span>
            </label>
          </div>
        </motion.div>

        {/* Опции голосования */}
        <motion.div variants={itemAnimation} className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Options
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Add Option
            </button>
          </div>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder={`Option ${index + 1}`}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Список email для приватного голосования */}
        {!formData.isPublic && (
          <motion.div variants={itemAnimation} className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Allowed Emails
              </label>
              <button
                type="button"
                onClick={addEmail}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Add Email
              </button>
            </div>
            <div className="space-y-2">
              {formData.allowedEmails.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email address"
                  />
                  <button
                    type="button"
                    onClick={() => removeEmail(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div variants={itemAnimation} className="text-red-500 text-sm">
            {error}
          </motion.div>
        )}

        <motion.div variants={itemAnimation} className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </div>
            ) : (
              "Create Voting"
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
