const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Push Chain Project Setup");
  console.log("=============================");

  // 1. Generate a new private key if needed
  console.log("\n1. Generating new private key...");
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const address = wallet.address;
  
  console.log(`✅ New wallet created:`);
  console.log(`   Address: ${address}`);
  console.log(`   Private Key: ${privateKey}`);

  // 2. Create .env file
  console.log("\n2. Creating .env file...");
  const envContent = `# Private key for deployment (without 0x prefix)
PRIVATE_KEY=${privateKey}

# Push Chain API key for contract verification (optional for now)
# Get from: https://console.push.delivery
PUSHCHAIN_API_KEY=your_pushchain_api_key_here

# Supabase configuration (existing)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# 1inch API key (existing)
ONEINCH_API_KEY=your_1inch_api_key

# Push Chain Testnet Configuration
PUSH_CHAIN_RPC=https://testnet-rpc.pushchain.io
PUSH_CHAIN_CHAIN_ID=1001
PUSH_CHAIN_EXPLORER=https://testnet-explorer.pushchain.io
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ .env file created at: ${envPath}`);

  // 3. Test network connection
  console.log("\n3. Testing network connections...");
  
  try {
    // Test Push Chain connection
    console.log("   Testing Push Chain connection...");
    const pushChainProvider = new ethers.JsonRpcProvider('https://testnet-rpc.pushchain.io');
    const pushChainNetwork = await pushChainProvider.getNetwork();
    console.log(`   ✅ Push Chain: ${pushChainNetwork.name} (Chain ID: ${pushChainNetwork.chainId})`);
  } catch (error) {
    console.log(`   ⚠️  Push Chain connection failed: ${error.message}`);
    console.log("   This is expected if Push Chain testnet is not yet available");
  }

  // 4. Display next steps
  console.log("\n4. Next Steps:");
  console.log("   📝 Add your private key to .env file");
  console.log("   🔑 Get Push Chain API key from: https://console.push.delivery");
  console.log("   💰 Get test PUSH tokens from faucet (when available)");
  console.log("   🚀 Deploy contracts: npm run deploy:pushchain");
  console.log("   🧪 Test integration: npm run test:pushchain");

  // 5. Security warnings
  console.log("\n⚠️  Security Warnings:");
  console.log("   • Never share your private key");
  console.log("   • Never commit .env file to version control");
  console.log("   • Use testnet only for development");
  console.log("   • Keep your private key secure");

  console.log("\n🎉 Setup completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });

