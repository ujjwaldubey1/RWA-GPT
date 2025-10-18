#!/usr/bin/env node

/**
 * Find Working Push Chain RPC URL
 * Tests multiple potential RPC endpoints for Push Chain
 */

const { ethers } = require('ethers');

console.log('\n🔍 Finding Working Push Chain RPC URL\n');
console.log('='.repeat(60) + '\n');

// Potential RPC URLs to test
const rpcUrls = [
  'https://rpc.push.org',
  'https://testnet-rpc.push.org', 
  'https://rpc-testnet.push.org',
  'https://push-rpc.org',
  'https://testnet.pushchain.io',
  'https://rpc-testnet.pushchain.io',
  'https://testnet-rpc.pushchain.io',
  'https://api.push.org',
  'https://push-chain-rpc.org',
  'https://rpc.pushchain.network',
  'https://testnet.pushchain.network',
  'https://pushchain-rpc.org'
];

async function testRpcUrl(url, chainId = 1001) {
  try {
    console.log(`🧪 Testing: ${url}`);
    
    const provider = new ethers.JsonRpcProvider(url, {
      chainId: chainId,
      name: 'Push Chain Testnet'
    });
    
    // Set a timeout for the request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    // Test basic connectivity
    const network = await Promise.race([
      provider.getNetwork(),
      timeoutPromise
    ]);
    
    console.log(`✅ SUCCESS! Chain ID: ${network.chainId}`);
    
    // Test with your wallet address
    const walletAddress = '0xBD6CA86C169af89720fcAD0b5595EE46eE4BaA52';
    try {
      const balance = await Promise.race([
        provider.getBalance(walletAddress),
        timeoutPromise
      ]);
      const balanceInEther = ethers.formatEther(balance);
      console.log(`💰 Balance check: ${parseFloat(balanceInEther).toFixed(6)} PC`);
    } catch (balanceError) {
      console.log(`⚠️  Balance check failed: ${balanceError.message}`);
    }
    
    return { success: true, url, chainId: network.chainId };
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return { success: false, url, error: error.message };
  }
}

async function main() {
  console.log('🎯 Testing multiple RPC URLs for Push Chain Testnet...\n');
  
  const results = [];
  
  for (const url of rpcUrls) {
    const result = await testRpcUrl(url);
    results.push(result);
    console.log(''); // Empty line between tests
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('='.repeat(60));
  console.log('\n📊 RESULTS SUMMARY\n');
  
  const workingUrls = results.filter(r => r.success);
  
  if (workingUrls.length > 0) {
    console.log('✅ WORKING RPC URLs FOUND:\n');
    workingUrls.forEach(r => {
      console.log(`   • ${r.url}`);
      console.log(`     Chain ID: ${r.chainId}\n`);
    });
    
    console.log('🎉 SUCCESS! Use one of these URLs in your configuration.\n');
    
    // Update the configuration files
    const workingUrl = workingUrls[0].url;
    console.log('📝 Next steps:');
    console.log(`   1. Update hardhat.config.js with: ${workingUrl}`);
    console.log(`   2. Update frontend/src/utils/pushChain.ts with: ${workingUrl}`);
    console.log(`   3. Restart your applications`);
    
  } else {
    console.log('❌ NO WORKING RPC URLs FOUND\n');
    console.log('💡 Possible solutions:');
    console.log('   1. Push Chain testnet might be temporarily down');
    console.log('   2. Network configuration might be different');
    console.log('   3. Try asking in Push Protocol Discord');
    console.log('   4. Use local testing instead (npx hardhat node)');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);



