// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockRWAPool {
    address public owner;
    uint256 public totalInvested;

    event Invested(address indexed investor, uint256 amount);
    event YieldDistributed(uint256 totalAmount, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    function invest() external payable {
        require(msg.value > 0, "Must invest more than 0");
        totalInvested += msg.value;
        emit Invested(msg.sender, msg.value);
    }

    function distributeYield(uint256 totalAmount) external {
        require(msg.sender == owner, "Only owner can distribute yield");
        emit YieldDistributed(totalAmount, block.timestamp);
    }
}


