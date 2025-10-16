const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Polygon...");
  
  // Get the contract factory
  const MockRWAPool = await ethers.getContractFactory("MockRWAPool");
  
  // Deploy the contract
  console.log("📦 Deploying MockRWAPool contract...");
  const rwaPool = await MockRWAPool.deploy();
  
  // Wait for deployment to complete
  await rwaPool.waitForDeployment();
  
  const contractAddress = await rwaPool.getAddress();
  const network = await ethers.provider.getNetwork();
  
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId, ")");
  
  // Show appropriate block explorer based on network
  if (network.chainId === 80002n) {
    console.log("🔗 Block Explorer:", `https://amoy.polygonscan.com/address/${contractAddress}`);
  } else if (network.chainId === 137n) {
    console.log("🔗 Block Explorer:", `https://polygonscan.com/address/${contractAddress}`);
  } else if (network.chainId === 1001n) {
    console.log("🔗 Block Explorer:", `https://testnet-explorer.pushchain.io/address/${contractAddress}`);
  } else {
    console.log("🔗 Block Explorer: Local network");
  }
  
  // Verify contract based on network
  if (network.chainId === 80002n || network.chainId === 137n) {
    console.log("🔍 Verifying contract on Polygon explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  } else if (network.chainId === 1001n) {
    console.log("🔍 Verifying contract on Push Chain explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };
  
  const fs = require('fs');
  const path = require('path');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `deployment-${network.name}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", deploymentFile);
  
  // Test basic contract functionality
  console.log("🧪 Testing contract functionality...");
  
  try {
    const owner = await rwaPool.owner();
    const totalInvested = await rwaPool.totalInvested();
    
    console.log("👤 Contract Owner:", owner);
    console.log("💰 Total Invested:", ethers.formatEther(totalInvested), "ETH");
    
    console.log("✅ Contract is working correctly!");
  } catch (error) {
    console.log("❌ Contract test failed:", error.message);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("1. Update your frontend to use the new contract address");
  console.log("2. Update subgraph configuration with new contract address");
  console.log("3. Test the application with Polygon integration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
