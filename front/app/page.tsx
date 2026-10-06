"use client";

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AnimatedPage } from './components/AnimatedPage';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export default function HomePage() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  return (
    <AnimatedPage animation="fade">
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#8247e5] to-[#b54aff] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
              <div className="flex items-center gap-x-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center space-x-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm font-semibold leading-6 text-purple-600 dark:text-purple-300 ring-1 ring-inset ring-purple-500/20">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.95-11.95l-2.586-2.586a1 1 0 00-1.414 1.414L8.636 11.9a1 1 0 001.414 0zM12 13a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  <span>Powered by Polygon</span>
                </span>
              </div>

              <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-600">
                Secure Voting Platform on Blockchain
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Create and manage secure voting events with Polygon blockchain technology. Our platform ensures transparency, reliability, and immutability in every vote.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                {session ? (
                  <Link
                    href="/votings"
                    className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#8247e5] to-[#b54aff] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      View Votings
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#8247e5] to-[#b54aff] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Create account <span aria-hidden="true">→</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-[576px] h-[360px] rounded-2xl bg-gradient-to-b from-[#8247e5]/10 to-[#b54aff]/10 p-8 backdrop-blur-sm border border-purple-500/20"
                >
                  {/* Laptop Frame */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl overflow-hidden">
                    {/* Screen */}
                    <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 p-4">
                      {/* Navbar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-32 rounded bg-gray-700" />
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        {/* Polygon Network Status */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8">
                              <svg viewBox="0 0 38 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M29.344 8.5L19.672 3L10 8.5V19.5L19.672 25L29.344 19.5V8.5Z" stroke="#8247E5" strokeWidth="2"/>
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-purple-400">Polygon Network</div>
                              <div className="text-xs text-gray-400">Connected</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-green-500">Active</span>
                          </div>
                        </div>

                        {/* Voting Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <div className="text-sm text-gray-400">Total Votes</div>
                            <div className="text-xl font-bold text-purple-400">1,234</div>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <div className="text-sm text-gray-400">Active Votings</div>
                            <div className="text-xl font-bold text-purple-400">56</div>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                          <div className="text-sm font-medium text-gray-300 mb-3">Recent Activity</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Vote Cast</span>
                              <span className="text-purple-400">2 min ago</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">New Proposal</span>
                              <span className="text-purple-400">5 min ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reflection Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/10 to-transparent rounded-b-2xl" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl lg:text-center">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center space-x-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm font-semibold leading-6 text-purple-600 dark:text-purple-300 ring-1 ring-inset ring-purple-500/20">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.95-11.95l-2.586-2.586a1 1 0 00-1.414 1.414L8.636 11.9a1 1 0 001.414 0zM12 13a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                <span>Features</span>
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-600">
              Everything you need for transparent voting
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our platform combines the power of Polygon blockchain technology with an easy-to-use interface to make voting secure, transparent, and accessible.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 hover:ring-purple-500/20 transition-all duration-300"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  Blockchain Security
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Every vote is secured by Polygon blockchain technology, ensuring immutability and transparency of the voting process.</p>
                </dd>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 hover:ring-purple-500/20 transition-all duration-300"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  Easy Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Create and manage voting events with ease. Monitor results in real-time and export detailed reports.</p>
                </dd>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 hover:ring-purple-500/20 transition-all duration-300"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Participant Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Easily manage voting participants, set permissions, and ensure only authorized users can participate.</p>
                </dd>
              </motion.div>
            </dl>
          </div>
        </div>
      </main>
    </AnimatedPage>
  );
}
