// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VotingPlatform
 * @dev A platform for creating and managing votings with subscription support
 */
contract VotingPlatform is Ownable {
    struct Voting {
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        string[] options;
        bool isPublic;
        mapping(bytes32 => bool) hasVoted;
        mapping(uint256 => uint256) votes;
        bool isActive;
        address[] allowedVoters;
    }

    mapping(uint256 => Voting) public votings;
    uint256 public votingCount;

    event VotingCreated(uint256 votingId);
    event VoteCast(uint256 votingId, uint256 optionIndex);

    constructor() Ownable(msg.sender) {}

    function createVoting(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _options,
        bool _isPublic,
        address[] memory _allowedVoters
    ) external onlyOwner returns (uint256) {
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_options.length >= 2, "At least 2 options required");

        uint256 votingId = votingCount++;
        Voting storage voting = votings[votingId];

        voting.name = _name;
        voting.description = _description;
        voting.startTime = _startTime;
        voting.endTime = _endTime;
        voting.options = _options;
        voting.isPublic = _isPublic;
        voting.isActive = true;

        if (!_isPublic) {
            voting.allowedVoters = _allowedVoters;
        }

        emit VotingCreated(votingId);
        return votingId;
    }

    function vote(uint256 _votingId, uint256 _optionIndex, bytes32 _voterIdentifier) external {
        Voting storage voting = votings[_votingId];
        require(voting.isActive, "Voting is not active");
        require(block.timestamp >= voting.startTime, "Voting has not started");
        require(block.timestamp <= voting.endTime, "Voting has ended");
        require(_optionIndex < voting.options.length, "Invalid option");
        require(!voting.hasVoted[_voterIdentifier], "Already voted");

        if (!voting.isPublic) {
            bool isAllowed = false;
            for (uint i = 0; i < voting.allowedVoters.length; i++) {
                if (voting.allowedVoters[i] == msg.sender) {
                    isAllowed = true;
                    break;
                }
            }
            require(isAllowed, "Not allowed to vote");
        }

        voting.hasVoted[_voterIdentifier] = true;
        voting.votes[_optionIndex]++;

        emit VoteCast(_votingId, _optionIndex);
    }

    function hasVoted(uint256 _votingId, bytes32 _voterIdentifier) external view returns (bool) {
        return votings[_votingId].hasVoted[_voterIdentifier];
    }

    function getVotingDetails(uint256 _votingId) external view returns (
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        string[] memory options,
        bool isPublic,
        bool isActive,
        address[] memory allowedVoters
    ) {
        Voting storage voting = votings[_votingId];
        return (
            voting.name,
            voting.description,
            voting.startTime,
            voting.endTime,
            voting.options,
            voting.isPublic,
            voting.isActive,
            voting.allowedVoters
        );
    }

    function getVotes(uint256 _votingId, uint256 _optionIndex) external view returns (uint256) {
        return votings[_votingId].votes[_optionIndex];
    }
}
