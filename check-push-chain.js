#!/usr/bin/env node

/**
 * Check Push Chain Testnet Balance
 * Now that we know Push Chain is live!
 */

const { ethers } = require('ethers');

console.log('\n🚀 Push Chain Testnet Balance Check\n');
console.log('='.repeat(60) + '\n');

// Push Chain Testnet configuration (now that it's live!)
const PUSH_CHAIN_CONFIG = {
  name: 'Push Chain Testnet',
  rpc: 'https://rpc.push.org',  // Updated RPC
  chainId: 1001,
  currency: 'PC',
  explorer: 'https://donut.push.network'
};

// Your addresses
const addresses = [
  {
    name: 'Original Address (from .env)',
    address: '0x00Cb8d26509c766919B5E5bB32cd86BB3F6Ce57C'
  },
  {
    name: 'Push Chain Address (from screenshots)',
    address: '0xBD6CA86C169af89720fcAD0b5595EE46eE4BaA52'
  }
];

async function checkPushChainBalance(address, name) {
  try {
    console.log(`\n🔍 ${name}`);
    console.log('─'.repeat(60));
    console.log(`Address: ${address}`);
    
    const provider = new ethers.JsonRpcProvider(PUSH_CHAIN_CONFIG.rpc, {
      chainId: PUSH_CHAIN_CONFIG.chainId,
      name: PUSH_CHAIN_CONFIG.name
    });
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get balance
    const balance = await provider.getBalance(address);
    const balanceInEther = ethers.formatEther(balance);
    const balanceNum = parseFloat(balanceInEther);
    
    if (balanceNum > 0) {
      console.log(`💰 Balance: ${balanceNum.toFixed(6)} PC ✅ HAS FUNDS!`);
      console.log(`🔗 Explorer: ${PUSH_CHAIN_CONFIG.explorer}/address/${address}`);
    } else {
      console.log(`💰 Balance: 0 PC`);
    }
    
    // Get transaction count
    const txCount = await provider.getTransactionCount(address);
    console.log(`📊 Transactions: ${txCount}`);
    
    return { success: true, balance: balanceNum, address };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, address };
  }
}

async function main() {
  console.log('🎯 Checking both addresses on Push Chain Testnet...\n');
  
  for (const addr of addresses) {
    await checkPushChainBalance(addr.address, addr.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 SUMMARY\n');
  
  console.log('🎉 Push Chain Testnet is LIVE!');
  console.log('✅ Faucet: https://faucet.push.org');
  console.log('✅ Explorer: https://donut.push.network');
  console.log('✅ RPC: https://rpc.push.org');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Get PC tokens from faucet');
  console.log('2. Deploy your contract to Push Chain');
  console.log('3. Test gas abstraction!');
  console.log('4. Update your frontend to use Push Chain');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);

