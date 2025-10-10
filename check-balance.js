#!/usr/bin/env node

/**
 * Check Wallet Balance Across Networks
 * Checks for PUSH tokens and native currency on multiple networks
 */

const { ethers } = require('ethers');

const WALLET_ADDRESS = '0x00Cb8d26509c766919B5E5bB32cd86BB3F6Ce57C';

console.log('\n💰 Checking Wallet Balance\n');
console.log('='.repeat(60) + '\n');
console.log(`Wallet: ${WALLET_ADDRESS}\n`);
console.log('='.repeat(60) + '\n');

// Network configurations
const networks = [
  {
    name: 'Push Chain Testnet',
    rpc: 'https://testnet-rpc.pushchain.io',
    chainId: 1001,
    currency: 'PUSH',
    explorer: 'https://testnet-explorer.pushchain.io'
  },
  {
    name: 'Push Chain Devnet',
    rpc: 'https://rpc-devnet.push.org',
    chainId: 998,
    currency: 'PUSH',
    explorer: 'https://explorer-devnet.push.org'
  },
  {
    name: 'Polygon Amoy Testnet',
    rpc: 'https://rpc-amoy.polygon.technology',
    chainId: 80002,
    currency: 'MATIC',
    explorer: 'https://amoy.polygonscan.com'
  },
  {
    name: 'Ethereum Sepolia',
    rpc: 'https://rpc.sepolia.org',
    chainId: 11155111,
    currency: 'ETH',
    explorer: 'https://sepolia.etherscan.io'
  }
];

async function checkBalance(network) {
  try {
    console.log(`\n🌐 ${network.name}`);
    console.log('─'.repeat(60));
    
    const provider = new ethers.JsonRpcProvider(network.rpc, {
      chainId: network.chainId,
      name: network.name
    });
    
    // Set a timeout for the request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    // Check network connectivity
    const networkInfo = await Promise.race([
      provider.getNetwork(),
      timeoutPromise
    ]);
    
    console.log(`✅ Connected to chain ID: ${networkInfo.chainId}`);
    
    // Get balance
    const balance = await Promise.race([
      provider.getBalance(WALLET_ADDRESS),
      timeoutPromise
    ]);
    
    const balanceInEther = ethers.formatEther(balance);
    const balanceNum = parseFloat(balanceInEther);
    
    if (balanceNum > 0) {
      console.log(`💰 Balance: ${balanceNum.toFixed(6)} ${network.currency} ✅ HAS FUNDS!`);
      console.log(`🔗 Explorer: ${network.explorer}/address/${WALLET_ADDRESS}`);
    } else {
      console.log(`💰 Balance: 0 ${network.currency}`);
      console.log(`ℹ️  No funds on this network yet`);
    }
    
    // Get transaction count to see if wallet has been used
    const txCount = await Promise.race([
      provider.getTransactionCount(WALLET_ADDRESS),
      timeoutPromise
    ]);
    
    if (txCount > 0) {
      console.log(`📊 Transactions: ${txCount} (wallet has been used)`);
    }
    
    return { success: true, balance: balanceNum, network: network.name };
    
  } catch (error) {
    console.log(`❌ Could not connect: ${error.message}`);
    return { success: false, network: network.name };
  }
}

async function main() {
  const results = [];
  
  for (const network of networks) {
    const result = await checkBalance(network);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between requests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  
  const networksWithFunds = results.filter(r => r.success && r.balance > 0);
  
  if (networksWithFunds.length > 0) {
    console.log('✅ You have funds on the following networks:\n');
    networksWithFunds.forEach(r => {
      console.log(`   • ${r.network}: ${r.balance.toFixed(6)} tokens`);
    });
    console.log('\n🎉 You can start testing your dApp!\n');
  } else {
    console.log('❌ No funds found on any network yet.\n');
    console.log('💡 To get testnet tokens:\n');
    console.log('   1. Polygon Amoy MATIC:');
    console.log('      → https://faucet.polygon.technology/\n');
    console.log('   2. Push Chain PUSH (ask in Discord):');
    console.log('      → https://discord.gg/pushprotocol\n');
  }
  
  const successfulConnections = results.filter(r => r.success);
  const failedConnections = results.filter(r => !r.success);
  
  console.log(`📡 Network Status:`);
  console.log(`   • Connected: ${successfulConnections.length}/${networks.length}`);
  
  if (failedConnections.length > 0) {
    console.log(`   • Failed: ${failedConnections.map(r => r.network).join(', ')}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);

