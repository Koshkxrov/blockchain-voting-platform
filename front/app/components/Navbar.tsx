"use client";

import { Fragment, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface NavigationItem {
  name: string;
  href: string;
}

interface UserProfile {
  email: string;
  walletAddress: string;
  role: string;
  subscription?: {
    isActive: boolean;
    status: string;
  };
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { hasSubscription } = useSubscription();
  const [navigation, setNavigation] = useState<NavigationItem[]>([
    { name: 'Home', href: '/' },
    { name: 'Votings', href: '/votings' },
  ]);
  const { theme, setTheme } = useTheme();

  // Update navigation based on session and subscription status
  useEffect(() => {
    const baseNavigation = [
      { name: 'Home', href: '/' },
      { name: 'Votings', href: '/votings' },
    ];

    if (status === 'authenticated' && session?.user && hasSubscription) {
      baseNavigation.push({ name: 'Create Voting', href: '/create' });
    }

    setNavigation(baseNavigation);
  }, [status, session, hasSubscription]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Authentication section component
  const AuthSection = () => {
    if (status === 'loading') {
      return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
    }

    if (status === 'authenticated' && session?.user) {
      return (
        <Menu as="div" className="relative ml-3">
          <div>
            <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                {session.user.email?.[0].toUpperCase()}
              </div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/profile"
                    className={classNames(
                      active ? 'bg-gray-700' : '',
                      'block px-4 py-2 text-sm text-gray-300 hover:text-white'
                    )}
                  >
                    Your Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/subscription"
                    className={classNames(
                      active ? 'bg-gray-700' : '',
                      'block px-4 py-2 text-sm text-gray-300 hover:text-white'
                    )}
                  >
                    Subscription
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut()}
                    className={classNames(
                      active ? 'bg-gray-700' : '',
                      'block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white'
                    )}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-gray-300 hover:text-white text-sm font-medium"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Sign up
        </Link>
      </div>
    );
  };

  return (
    <Disclosure as="nav" className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border-b ${theme === 'dark' ? 'border-purple-900/20' : 'border-gray-200'}`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg transform rotate-45"></div>
                      <div className={`absolute inset-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-lg transform rotate-45`}></div>
                      <div className="absolute inset-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg transform rotate-45 animate-pulse"></div>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      VotingPlatform
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? `border-purple-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
                          : `border-transparent ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`,
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {session?.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={classNames(
                        pathname === '/admin'
                          ? `border-purple-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
                          : `border-transparent ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`,
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'} p-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Toggle theme</span>
                  {theme === 'dark' ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  )}
                </button>
                <AuthSection />
              </div>

              <div className="flex items-center sm:hidden">
                <Disclosure.Button className={`inline-flex items-center justify-center rounded-md p-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500`}>
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? `${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`
                      : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`,
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {session?.user?.role === 'admin' && (
                <Disclosure.Button
                  as={Link}
                  href="/admin"
                  className={classNames(
                    pathname === '/admin'
                      ? `${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`
                      : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`,
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                >
                  Admin
                </Disclosure.Button>
              )}
            </div>
            {status === 'authenticated' && session ? (
              <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-3 pt-4`}>
                <div className="flex items-center px-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {session.user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/profile"
                    className={`block px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/subscription"
                    className={`block px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    Subscription
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className={`block w-full text-left px-4 py-2 text-base font-medium ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-3 pt-4 px-4 space-y-2`}>
                <Link
                  href="/login"
                  className={`block ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'} text-base font-medium`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md text-base font-medium hover:from-purple-600 hover:to-blue-600"
                >
                  Sign up
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
