const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const creatorAddress = deployer.address;
  const mintPrice = ethers.utils.parseUnits("10", 6); // Price: 10 USDC
  const maxSupply = 100;
  // This is the Amoy Testnet USDC address
  const usdcTokenAddress = "0x41e94eb019c0762f9bfc45458685637482e9b681";

  const RevenueDistributor = await ethers.getContractFactory("RevenueDistributor");
  const distributor = await RevenueDistributor.deploy(
    creatorAddress,
    mintPrice,
    maxSupply,
    usdcTokenAddress
  );

  await distributor.deployed();
  
  const nftContractAddress = await distributor.nftContract();

  console.log("✅ RevenueDistributor deployed to:", distributor.address);
  console.log("✅ FlowMintNFT deployed to:", nftContractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});