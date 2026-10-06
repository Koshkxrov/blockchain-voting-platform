'use client';

import { motion } from 'framer-motion';
import CreateVotingForm from '../components/CreateVotingForm';
import SubscriptionCheck from '../components/SubscriptionCheck';

export default function CreateVotingPage() {
  return (
    <SubscriptionCheck>
      <div lang="en" className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Voting
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Set up your voting session with options and settings
            </p>
          </motion.div>
          <CreateVotingForm />
        </div>
      </div>
    </SubscriptionCheck>
  );
}
