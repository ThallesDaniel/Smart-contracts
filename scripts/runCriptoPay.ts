import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer, operator, beneficiary] = await ethers.getSigners();

  console.log("Deployer:", await deployer.getAddress());
  console.log("Operator:", await operator.getAddress());
  console.log("Beneficiary:", await beneficiary.getAddress());

  // 1 Deploy dos mocks
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const tokenIn = await MockERC20.deploy("TokenIn", "TIN");
  const tokenOut = await MockERC20.deploy("TokenOut", "TOUT");
  const usdt = await MockERC20.deploy("Tether USD", "USDT");

  const MockRouter = await ethers.getContractFactory("MockRouter");
  const router = await MockRouter.deploy();

  const CriptoPayRouter = await ethers.getContractFactory("CriptoPayRouter");
  const criptoPay = await CriptoPayRouter.deploy(
    await router.getAddress(),
    await usdt.getAddress(),
    await operator.getAddress()
  );

  console.log("tokenIn:", await tokenIn.getAddress());
  console.log("tokenOut:", await tokenOut.getAddress());
  console.log("USDT:", await usdt.getAddress());
  console.log("Router:", await router.getAddress());
  console.log("CriptoPayRouter:", await criptoPay.getAddress());

  const amountIn = ethers.parseEther("100");

  // 2 Mint de tokenIn para o operator (hot wallet)
  await tokenIn.mint(await operator.getAddress(), amountIn);
  console.log(
    "Saldo inicial tokenIn do operator:",
    (await tokenIn.balanceOf(await operator.getAddress())).toString()
  );

  // 3 Operator aprova o contrato CriptoPayRouter
  await tokenIn
    .connect(operator)
    .approve(await criptoPay.getAddress(), amountIn);

  // 4 Faz o swap tokenIn -> tokenOut pro beneficiary
  const tx = await criptoPay
    .connect(operator)
    .swapCryptoToCryptoFor(
      await tokenIn.getAddress(),
      await tokenOut.getAddress(),
      amountIn,
      0n,
      await beneficiary.getAddress()
    );

  await tx.wait();
  console.log("Swap executado! tx:", tx.hash);

  const balanceTokenOutBeneficiary = await tokenOut.balanceOf(
    await beneficiary.getAddress()
  );

  console.log(
    "Saldo final tokenOut do beneficiary:",
    balanceTokenOutBeneficiary.toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
