import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [signer] = await ethers.getSigners();

  console.log("Network:", await ethers.provider.getNetwork());
  console.log("Signer:", await signer.getAddress());
  console.log(
    "Balance (wei):",
    (await ethers.provider.getBalance(await signer.getAddress())).toString()
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
