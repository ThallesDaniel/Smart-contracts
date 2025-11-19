// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./MockERC20.sol";

contract MockRouter {
    // Mock de Uniswap: taxa 1:1 só pra teste
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256,
        address[] calldata path,
        address to,
        uint256 
    ) external returns (uint256[] memory amounts) {
        require(path.length == 2, "path len");

        MockERC20 tokenIn = MockERC20(path[0]);
        MockERC20 tokenOut = MockERC20(path[1]);

        // puxa do msg.sender (CriptoPayRouter)
        tokenIn.transferFrom(msg.sender, address(this), amountIn);

        tokenOut.mint(to, amountIn);

        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountIn;
    }
}
        