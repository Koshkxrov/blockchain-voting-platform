export const VOTING_PLATFORM_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_subscriptionCode",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "_isPublic",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "_isEducational",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "_hasNFT",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      },
      {
        "internalType": "string[]",
        "name": "_allowedEmails",
        "type": "string[]"
      },
      {
        "internalType": "string",
        "name": "_providedSubCode",
        "type": "string"
      }
    ],
    "name": "createVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_votingId",
        "type": "uint256"
      }
    ],
    "name": "endVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_votingId",
        "type": "uint256"
      }
    ],
    "name": "getVotingInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isPublic",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isEducational",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasNFT",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isEnded",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "allowedEmailsCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_votingId",
        "type": "uint256"
      }
    ],
    "name": "getVotingResults",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_votingId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_optionIndex",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_userEmail",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_confirmationCode",
        "type": "string"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "accounts",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      }
    ],
    "name": "balanceOfBatch",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
