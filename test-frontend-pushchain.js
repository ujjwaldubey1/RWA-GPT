#!/usr/bin/env node

/**
 * Test Frontend Push Chain Integration
 * This script will help you test the frontend with Push Chain
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 Testing Frontend Push Chain Integration\n');
console.log('='.repeat(60) + '\n');

// Check if frontend dependencies are installed
console.log('📦 Checking Frontend Dependencies...\n');

const frontendPackageJson = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(frontendPackageJson)) {
  const packageJson = JSON.parse(fs.readFileSync(frontendPackageJson, 'utf-8'));
  
  console.log('✅ Frontend package.json found');
  
  // Check for Push Protocol packages
  const pushPackages = [
    '@pushprotocol/push-chain',
    '@pushprotocol/restapi', 
    '@pushprotocol/uiweb',
    'ethers'
  ];
  
  console.log('\n📋 Push Protocol Packages:');
  pushPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg]) {
      console.log(`✅ ${pkg}: ${packageJson.dependencies[pkg]}`);
    } else {
      console.log(`❌ ${pkg}: NOT INSTALLED`);
    }
  });
  
  console.log('\n📋 Other Dependencies:');
  const otherPackages = ['next', 'react', 'react-dom'];
  otherPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg]) {
      console.log(`✅ ${pkg}: ${packageJson.dependencies[pkg]}`);
    } else {
      console.log(`❌ ${pkg}: NOT INSTALLED`);
    }
  });
  
} else {
  console.log('❌ Frontend package.json not found');
}

console.log('\n' + '='.repeat(60) + '\n');

// Check Push Chain configuration
console.log('⚙️ Checking Push Chain Configuration...\n');

const pushChainUtils = path.join(__dirname, 'frontend', 'src', 'utils', 'pushChain.ts');
if (fs.existsSync(pushChainUtils)) {
  const content = fs.readFileSync(pushChainUtils, 'utf-8');
  
  console.log('✅ Push Chain utilities found');
  
  // Check for key configurations
  const checks = [
    { name: 'RPC URL', pattern: /rpcUrl:\s*['"`]([^'"`]+)['"`]/, expected: 'https://rpc.push.org' },
    { name: 'Chain ID', pattern: /chainId:\s*(\d+)/, expected: '1001' },
    { name: 'Explorer URL', pattern: /blockExplorerUrl:\s*['"`]([^'"`]+)['"`]/, expected: 'https://donut.push.network' },
    { name: 'Gas Abstraction', pattern: /gasless:\s*(true|false)/, expected: 'true' }
  ];
  
  checks.forEach(check => {
    const match = content.match(check.pattern);
    if (match) {
      const value = match[1] || match[0];
      if (value === check.expected) {
        console.log(`✅ ${check.name}: ${value}`);
      } else {
        console.log(`⚠️  ${check.name}: ${value} (expected: ${check.expected})`);
      }
    } else {
      console.log(`❌ ${check.name}: NOT FOUND`);
    }
  });
  
} else {
  console.log('❌ Push Chain utilities not found');
}

console.log('\n' + '='.repeat(60) + '\n');

// Check if node_modules exists
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
if (fs.existsSync(frontendNodeModules)) {
  console.log('✅ Frontend node_modules found');
} else {
  console.log('❌ Frontend node_modules not found');
  console.log('💡 Run: cd frontend && npm install');
}

console.log('\n' + '='.repeat(60) + '\n');

// Instructions for testing
console.log('🚀 HOW TO TEST FRONTEND WITH PUSH CHAIN:\n');

console.log('1️⃣  Install Dependencies (if needed):');
console.log('   cd frontend');
console.log('   npm install\n');

console.log('2️⃣  Start Frontend:');
console.log('   npm run dev\n');

console.log('3️⃣  Open Browser:');
console.log('   http://localhost:3000\n');

console.log('4️⃣  Connect MetaMask to Push Chain:');
console.log('   • Network Name: Push Chain Testnet');
console.log('   • RPC URL: https://rpc.push.org (or the working one)');
console.log('   • Chain ID: 1001');
console.log('   • Currency: PC');
console.log('   • Explorer: https://donut.push.network\n');

console.log('5️⃣  Import Your Push Chain Account:');
console.log('   • Use the private key for: 0xBD6CA86C169af89720fcAD0b5595EE46eE4BaA52');
console.log('   • You should see 8 PC tokens\n');

console.log('6️⃣  Test the Application:');
console.log('   • Click "Connect to Push Chain"');
console.log('   • Type: "show me investments"');
console.log('   • Type: "invest 1 PC in RE-001"');
console.log('   • Test gas abstraction!\n');

console.log('🎯 EXPECTED BEHAVIOR:');
console.log('   ✅ Wallet connects to Push Chain');
console.log('   ✅ Shows 8 PC balance');
console.log('   ✅ Chat responds with RWA options');
console.log('   ✅ Can initiate transactions');
console.log('   ✅ Gas abstraction should work (no gas fees!)');

console.log('\n' + '='.repeat(60) + '\n');

console.log('💡 TROUBLESHOOTING:');
console.log('   • If RPC doesn\'t work, try different RPC URLs');
console.log('   • Check MetaMask network settings');
console.log('   • Ensure you have PC tokens');
console.log('   • Check browser console for errors');

console.log('\n🎉 Ready to test Push Chain integration!\n');




