// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SubscriptionManager
 * @dev Manages user subscriptions for the voting platform
 */
contract SubscriptionManager {
    struct Subscription {
        bool isActive;
        uint256 endTime;
    }

    mapping(address => Subscription) private subscriptions;

    event SubscriptionUpdated(
        address indexed subscriber,
        bool isActive,
        uint256 endTime
    );

    /**
     * @dev Updates a user's subscription status
     * @param subscriber Address of the subscriber
     * @param isActive Whether the subscription is active
     * @param endTime When the subscription ends
     */
    function updateSubscription(
        address subscriber,
        bool isActive,
        uint256 endTime
    ) external {
        require(endTime > block.timestamp, "End time must be in the future");
        subscriptions[subscriber] = Subscription(isActive, endTime);
        emit SubscriptionUpdated(subscriber, isActive, endTime);
    }

    /**
     * @dev Checks if a user has an active subscription
     * @param subscriber Address to check
     * @return bool Whether the subscription is active
     */
    function hasActiveSubscription(address subscriber) public view returns (bool) {
        Subscription memory sub = subscriptions[subscriber];
        return sub.isActive && sub.endTime > block.timestamp;
    }

    /**
     * @dev Gets subscription details for a user
     * @param subscriber Address to check
     * @return isActive Whether the subscription is active
     * @return endTime When the subscription ends
     */
    function getSubscription(address subscriber) external view returns (
        bool isActive,
        uint256 endTime
    ) {
        Subscription memory sub = subscriptions[subscriber];
        return (sub.isActive, sub.endTime);
    }
}
