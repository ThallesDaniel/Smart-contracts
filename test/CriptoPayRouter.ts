import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CriptoPayRouter", function () {
  it("faz swap de tokenIn para tokenOut usando o router mock", async function () {
    const [deployer, operator, beneficiary] = await ethers.getSigners();

    // Deploy dos mocks
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const tokenIn = await MockERC20.deploy("TokenIn", "TIN") as any;
    const tokenOut = await MockERC20.deploy("TokenOut", "TOUT") as any;
    const usdt = await MockERC20.deploy("Tether USD", "USDT") as any;

    const MockRouter = await ethers.getContractFactory("MockRouter");
    const router = await MockRouter.deploy();

    const CriptoPayRouter = await ethers.getContractFactory("CriptoPayRouter");
    const criptoPay = await CriptoPayRouter.deploy(
      await router.getAddress(),
      await usdt.getAddress(),
      await operator.getAddress()
    ) as any;

    const amountIn = ethers.parseEther("100");

    // mint de tokenIn pro operator (hot wallet)
    await tokenIn.mint(await operator.getAddress(), amountIn);

    // operator aprova o contrato CriptoPayRouter
    await tokenIn
      .connect(operator)
      .approve(await criptoPay.getAddress(), amountIn);

    // chama a função via operator (onlyOperator)
    await criptoPay
      .connect(operator)
      .swapCryptoToCryptoFor(
        await tokenIn.getAddress(),
        await tokenOut.getAddress(),
        amountIn,
        0n,
        await beneficiary.getAddress()
      );

    const balanceOut = await tokenOut.balanceOf(
      await beneficiary.getAddress()
    );

    //mckRouter está 1:1, beneficiary deve ter 100 TOUT
    expect(balanceOut).to.equal(amountIn);
  });

  it("faz swap de USDT para tokenDestino", async function () {
    const [deployer, operator, beneficiary] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdt = await MockERC20.deploy("Tether USD", "USDT") as any;
    const tokenOut = await MockERC20.deploy("TokenOut", "TOUT") as any;

    const MockRouter = await ethers.getContractFactory("MockRouter");
    const router = await MockRouter.deploy();

    const CriptoPayRouter = await ethers.getContractFactory("CriptoPayRouter");
    const criptoPay = await CriptoPayRouter.deploy(
      await router.getAddress(),
      await usdt.getAddress(),
      await operator.getAddress()
    ) as any;

    const amountIn = ethers.parseEther("50");

    await usdt.mint(await operator.getAddress(), amountIn);
    await usdt
      .connect(operator)
      .approve(await criptoPay.getAddress(), amountIn);

    //swap USDT => tokenOut
    await criptoPay
      .connect(operator)
      .swapUsdtToCryptoFor(
        await tokenOut.getAddress(),
        amountIn,
        0n,
        await beneficiary.getAddress()
      );

    const balanceOut = await tokenOut.balanceOf(
      await beneficiary.getAddress()
    );

    expect(balanceOut).to.equal(amountIn);
  });
});
