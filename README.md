# Blockchain Voting Platform

A full-stack decentralized voting application built with Next.js, TypeScript,
Solidity, and Hardhat. The application uses the Polygon Amoy test network for
on-chain voting and MongoDB for account and voting metadata.

## Features

- Account registration and authentication
- Wallet connection and Polygon Amoy integration
- Public, private, and educational voting sessions
- Subscription activation and access checks
- Voting results and participation flows
- Administrative tools for users, subscriptions, voting sessions, and tokens

## Technology stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **API:** Next.js route handlers
- **Blockchain:** Solidity, Hardhat, Ethers.js, Polygon Amoy
- **Database and authentication:** MongoDB, NextAuth.js
- **Testing:** Hardhat, Chai, Jest, Testing Library

## Project structure

```text
contracts/   Solidity smart contracts
test/        Hardhat contract tests
front/       Next.js frontend and API routes
```

Generated build output, dependencies, and local secrets are intentionally not
stored in the repository.

## Local setup

### 1. Install the smart-contract dependencies

```bash
npm ci
```

Copy `.env.example` to `.env` and replace the placeholder values with your own
Polygon Amoy configuration.

### 2. Compile or test the contracts

```bash
npx hardhat compile
npm test
```

### 3. Install the frontend dependencies

```bash
cd front
npm ci
```

Copy `front/.env.local.example` to `front/.env.local` and configure MongoDB,
NextAuth, the RPC endpoint, contract addresses, and administrative credentials.

### 4. Run the application

```bash
npm run dev
```

Open <http://localhost:3000> in a browser.

## Security

Never commit `.env` or `.env.local` files. Keep private keys, database
credentials, authentication secrets, and subscription codes outside version
control.
