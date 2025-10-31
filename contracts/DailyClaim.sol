// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VulnFlowToken.sol"; 

contract DailyClaim is Ownable {
    VulnFlowToken public immutable token;
    uint256 public claimAmount = 10 * 10**18;
    uint256 public constant CLAIM_INTERVAL = 86400;
    mapping(address => uint256) public lastClaimTime;

    constructor(address _token) Ownable(msg.sender) {
        token = VulnFlowToken(_token);
    }

    /**
     * @dev Allows the caller to claim tokens if 24 hours have passed since their last claim.
     */
    function claim() public {
        if (block.timestamp < lastClaimTime[msg.sender] + CLAIM_INTERVAL) {
            revert("Claim too soon");
        }
        lastClaimTime[msg.sender] = block.timestamp;
        token.mint(msg.sender, claimAmount);
    }

    /**
     * @dev Sets a new claim amount, restricted to the owner.
     * @param newAmount The new amount of tokens to claim per call.
     */
    function setClaimAmount(uint256 newAmount) public onlyOwner {
        claimAmount = newAmount;
    }
}