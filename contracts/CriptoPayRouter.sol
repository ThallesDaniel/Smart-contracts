// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract CriptoPayRouter {
    IUniswapV2Router02 public immutable dexRouter;
    address public immutable USDT;
    address public owner;
    address public operator;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator");
        _;
    }

    constructor(address _router, address _usdt, address _operator) {
        require(_router != address(0) && _usdt != address(0) && _operator != address(0), "zero addr");
        dexRouter = IUniswapV2Router02(_router);
        USDT = _usdt;
        owner = msg.sender;
        operator = _operator;
    }

    function setOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "zero operator");
        operator = _operator;
    }

    /* ====================== CRIPTO -> CRIPTO ====================== */

    /// @notice API chama isso a partir do hot wallet
    ///         Os tokens devem estar no hot wallet e aprovados para este contrato
    function swapCryptoToCryptoFor(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address beneficiary
    ) external onlyOperator returns (uint256 amountOut) {
        require(beneficiary != address(0), "zero beneficiary");

        // puxar tokens do hot wallet (operator) para o contrato
        require(
            IERC20(tokenIn).transferFrom(operator, address(this), amountIn),
            "transferFrom failed"
        );

        // aprovar router
        IERC20(tokenIn).approve(address(dexRouter), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            beneficiary, // manda direto pro cliente/lojista
            block.timestamp + 300
        );

        amountOut = amounts[amounts.length - 1];
    }

    /* ====================== USDT -> CRIPTO ====================== */

    function swapUsdtToCryptoFor(
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address beneficiary
    ) external onlyOperator returns (uint256 amountOut) {
        require(beneficiary != address(0), "zero beneficiary");

        require(
            IERC20(USDT).transferFrom(operator, address(this), amountIn),
            "transferFrom failed"
        );

        IERC20(USDT).approve(address(dexRouter), amountIn);

        address[] memory path = new address[](2);
        path[0] = USDT;
        path[1] = tokenOut;

        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            beneficiary,
            block.timestamp + 300
        );

        amountOut = amounts[amounts.length - 1];
    }
}
