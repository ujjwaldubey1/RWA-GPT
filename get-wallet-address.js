#!/usr/bin/env node

/**
 * Get Wallet Address from Private Key
 * This script safely shows your wallet address without exposing the private key
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Finding Your Wallet Address\n');
console.log('='.repeat(50) + '\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found\n');
  
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  let privateKey = null;
  
  // Find PRIVATE_KEY in .env
  for (const line of lines) {
    if (line.trim().startsWith('PRIVATE_KEY=')) {
      const value = line.split('=')[1].trim();
      if (value && value !== 'your_private_key_here' && value !== '') {
        privateKey = value;
        break;
      }
    }
  }
  
  if (privateKey) {
    try {
      // Add 0x prefix if not present
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      console.log('📍 YOUR WALLET ADDRESS:');
      console.log('─'.repeat(50));
      console.log(`\n   ${wallet.address}\n`);
      console.log('─'.repeat(50));
      
      console.log('\n✅ This is the address you should share to receive testnet tokens!\n');
      console.log('💡 IMPORTANT:');
      console.log('   • Share ONLY this address (never your private key!)');
      console.log('   • This address works on ALL EVM networks');
      console.log('   • Use it for Push Chain, Polygon Amoy, etc.\n');
      
      console.log('📋 Quick Copy:');
      console.log(`   ${wallet.address}\n`);
      
      console.log('🚀 Where to Get Testnet Tokens:\n');
      console.log('   Polygon Amoy MATIC:');
      console.log('   └─ https://faucet.polygon.technology/');
      console.log('   └─ Enter your address above\n');
      
      console.log('   Push Chain PUSH (when available):');
      console.log('   └─ Check Push Protocol Discord');
      console.log('   └─ Or contact Push Protocol team\n');
      
      // Save address to file for easy access
      const addressFile = path.join(__dirname, 'MY_WALLET_ADDRESS.txt');
      fs.writeFileSync(addressFile, `My Wallet Address: ${wallet.address}\n\nUse this address to receive testnet tokens.\nNEVER share your private key with anyone!\n`);
      console.log(`💾 Address saved to: MY_WALLET_ADDRESS.txt\n`);
      
    } catch (error) {
      console.error('❌ Error reading private key:', error.message);
      console.log('\n💡 Your private key might be invalid. Please check your .env file.\n');
    }
  } else {
    console.log('❌ No private key found in .env file\n');
    console.log('💡 To set up your wallet:\n');
    console.log('   1. Run: npx hardhat run scripts/setup.js');
    console.log('   2. Or manually add your private key to .env\n');
    showMetaMaskInstructions();
  }
} else {
  console.log('❌ .env file not found\n');
  console.log('💡 To create .env file:\n');
  console.log('   1. Run: cp env.example .env');
  console.log('   2. Then run: npx hardhat run scripts/setup.js\n');
  showMetaMaskInstructions();
}

function showMetaMaskInstructions() {
  console.log('─'.repeat(50));
  console.log('\n🦊 OR Use Your MetaMask Address:\n');
  console.log('   1. Open MetaMask extension');
  console.log('   2. Click on your account name at top');
  console.log('   3. Click "Copy address"');
  console.log('   4. Use that address for testnet tokens!\n');
  console.log('─'.repeat(50) + '\n');
}

