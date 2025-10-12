const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Brosverse contracts...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");
  
  // ============================================
  // 1. Deploy BROS Token
  // ============================================
  console.log("📝 Deploying BROS Token...");
  
  const BrosToken = await hre.ethers.getContractFactory("BrosToken");
  
  // Define allocation addresses (replace with actual addresses)
  const communityPool = deployer.address; // Replace with actual multisig
  const teamVesting = deployer.address;   // Replace with vesting contract
  const treasury = deployer.address;      // Replace with DAO treasury
  const liquidityPool = deployer.address; // Replace with DEX pool
  const rewardsPool = deployer.address;   // Replace with rewards contract
  
  const brosToken = await BrosToken.deploy(
    communityPool,
    teamVesting,
    treasury,
    liquidityPool,
    rewardsPool
  );
  
  await brosToken.waitForDeployment();
  const brosTokenAddress = await brosToken.getAddress();
  console.log("✅ BROS Token deployed to:", brosTokenAddress, "\n");
  
  // ============================================
  // 2. Deploy Bros Token Factory
  // ============================================
  console.log("📝 Deploying Bros Token Factory...");
  
  const BrosTokenFactory = await hre.ethers.getContractFactory("BrosTokenFactory");
  
  const creationFee = hre.ethers.parseEther("100"); // 100 BROS to create a token
  const feeCollector = treasury; // Fees go to treasury
  
  const tokenFactory = await BrosTokenFactory.deploy(
    brosTokenAddress,
    feeCollector,
    creationFee
  );
  
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log("✅ Bros Token Factory deployed to:", tokenFactoryAddress, "\n");
  
  // ============================================
  // 3. Deploy Bros Staking
  // ============================================
  console.log("📝 Deploying Bros Staking...");
  
  const BrosStaking = await hre.ethers.getContractFactory("BrosStaking");
  
  const minStakeAmount = hre.ethers.parseEther("10"); // Minimum 10 BROS
  
  const staking = await BrosStaking.deploy(
    brosTokenAddress,
    minStakeAmount
  );
  
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ Bros Staking deployed to:", stakingAddress, "\n");
  
  // ============================================
  // 4. Deploy Bros Governance
  // ============================================
  console.log("📝 Deploying Bros Governance...");
  
  const BrosGovernance = await hre.ethers.getContractFactory("BrosGovernance");
  
  const governance = await BrosGovernance.deploy(brosTokenAddress);
  
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ Bros Governance deployed to:", governanceAddress, "\n");
  
  // ============================================
  // Summary
  // ============================================
  console.log("🎉 All contracts deployed successfully!\n");
  console.log("================================================");
  console.log("Contract Addresses:");
  console.log("================================================");
  console.log("BROS Token:         ", brosTokenAddress);
  console.log("Token Factory:      ", tokenFactoryAddress);
  console.log("Staking:            ", stakingAddress);
  console.log("Governance:         ", governanceAddress);
  console.log("================================================\n");
  
  console.log("📋 Next steps:");
  console.log("1. Update src/config/contracts.ts with these addresses");
  console.log("2. Verify contracts on Etherscan (if on Sepolia)");
  console.log("3. Transfer BROS tokens to staking contract for rewards");
  console.log("4. Set up governance parameters");
  console.log("5. Configure token factory creation fee\n");
  
  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      BrosToken: brosTokenAddress,
      BrosTokenFactory: tokenFactoryAddress,
      BrosStaking: stakingAddress,
      BrosGovernance: governanceAddress
    }
  };
  
  fs.writeFileSync(
    `deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`✅ Deployment info saved to deployments-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
