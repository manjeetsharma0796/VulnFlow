// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentProcessor {
    IERC20 public immutable token;

    event FixPaid(address indexed user, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    /**
     * @dev Transfers the specified amount of tokens from the caller to the contract.
     * @param cost The amount of tokens to transfer.
     */
    function payForFix(uint256 cost) public {
        if (!token.transferFrom(msg.sender, address(this), cost)) {
            revert("Transfer failed");
        }
        emit FixPaid(msg.sender, cost);
    }
}