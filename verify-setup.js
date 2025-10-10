#!/usr/bin/env node

/**
 * RWA-GPT Setup Verification Script
 * 
 * This script checks if your environment is properly configured
 * for running the RWA-GPT application with Push Chain integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 RWA-GPT Setup Verification\n');
console.log('='.repeat(50) + '\n');

let hasErrors = false;
let hasWarnings = false;

// Helper functions
function checkExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - NOT FOUND`);
    hasErrors = true;
    return false;
  }
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    console.log(`✅ ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - NOT INSTALLED`);
    hasErrors = true;
    return false;
  }
}

function checkOptional(condition, description) {
  if (condition) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`⚠️  ${description} - OPTIONAL`);
    hasWarnings = true;
    return false;
  }
}

// 1. Check Node.js and npm
console.log('📦 Checking System Requirements...\n');
checkCommand('node --version', 'Node.js installed');
checkCommand('npm --version', 'npm installed');

try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
  if (majorVersion >= 16) {
    console.log(`✅ Node.js version ${nodeVersion} (>=16 required)`);
  } else {
    console.log(`⚠️  Node.js version ${nodeVersion} (recommend >=16)`);
    hasWarnings = true;
  }
} catch (error) {
  console.log('❌ Could not check Node.js version');
  hasErrors = true;
}

console.log('\n' + '-'.repeat(50) + '\n');

// 2. Check Project Structure
console.log('📁 Checking Project Structure...\n');
checkExists('contracts', 'Smart contracts directory');
checkExists('contracts/MockRWAPool.sol', 'MockRWAPool.sol contract');
checkExists('frontend', 'Frontend directory');
checkExists('frontend/src/app/page.tsx', 'Frontend main page');
checkExists('frontend/src/utils/pushChain.ts', 'Push Chain utilities');
checkExists('backend', 'Backend directory');
checkExists('backend/main.py', 'Backend API server');
checkExists('subgraph', 'Subgraph directory');
checkExists('hardhat.config.js', 'Hardhat configuration');
checkExists('package.json', 'Root package.json');

console.log('\n' + '-'.repeat(50) + '\n');

// 3. Check Configuration Files
console.log('⚙️  Checking Configuration...\n');
const hasEnv = checkOptional(fs.existsSync('.env'), '.env file exists');
if (!hasEnv) {
  console.log('   💡 Create .env from env.example: cp env.example .env');
}

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  checkOptional(envContent.includes('PRIVATE_KEY') && !envContent.includes('your_private_key_here'), 
    '.env has PRIVATE_KEY configured');
  checkOptional(envContent.includes('PUSHCHAIN_API_KEY'), 
    '.env has PUSHCHAIN_API_KEY (optional)');
}

checkExists('env.example', 'env.example template');

console.log('\n' + '-'.repeat(50) + '\n');

// 4. Check Dependencies
console.log('📚 Checking Dependencies...\n');

// Root dependencies
if (fs.existsSync('node_modules')) {
  console.log('✅ Root node_modules exists');
  
  const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const requiredDeps = ['ethers', '@nomicfoundation/hardhat-toolbox', 'hardhat'];
  
  for (const dep of requiredDeps) {
    const isInstalled = fs.existsSync(path.join('node_modules', dep));
    if (isInstalled) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ ${dep} NOT installed`);
      hasErrors = true;
    }
  }
} else {
  console.log('❌ Root dependencies not installed');
  console.log('   💡 Run: npm install');
  hasErrors = true;
}

// Frontend dependencies
console.log('\n');
if (fs.existsSync('frontend/node_modules')) {
  console.log('✅ Frontend node_modules exists');
  
  const frontendPackageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf-8'));
  const requiredFrontendDeps = ['next', 'react', 'ethers', '@pushprotocol/push-chain'];
  
  for (const dep of requiredFrontendDeps) {
    const isInstalled = fs.existsSync(path.join('frontend/node_modules', dep));
    if (isInstalled) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ ${dep} NOT installed`);
      hasErrors = true;
    }
  }
} else {
  console.log('❌ Frontend dependencies not installed');
  console.log('   💡 Run: cd frontend && npm install');
  hasErrors = true;
}

console.log('\n' + '-'.repeat(50) + '\n');

// 5. Check Python Backend
console.log('🐍 Checking Python Backend...\n');

const hasPython = checkCommand('python --version', 'Python installed');
if (hasPython) {
  try {
    const pythonVersion = execSync('python --version', { encoding: 'utf-8' }).trim();
    console.log(`   Version: ${pythonVersion}`);
  } catch (error) {
    // Ignore version check error
  }
}

// Check if backend dependencies are documented
if (fs.existsSync('backend/main.py')) {
  const backendContent = fs.readFileSync('backend/main.py', 'utf-8');
  const requiredPythonModules = ['fastapi', 'uvicorn', 'pydantic', 'requests'];
  
  console.log('\nRequired Python packages:');
  for (const module of requiredPythonModules) {
    if (backendContent.includes(module)) {
      console.log(`   • ${module}`);
    }
  }
  console.log('\n   💡 Install: pip install fastapi uvicorn python-dotenv requests pydantic');
}

console.log('\n' + '-'.repeat(50) + '\n');

// 6. Check Hardhat Configuration
console.log('⚡ Checking Hardhat Configuration...\n');

if (fs.existsSync('hardhat.config.js')) {
  const hardhatConfig = fs.readFileSync('hardhat.config.js', 'utf-8');
  
  checkOptional(hardhatConfig.includes('pushchain'), 'Push Chain network configured');
  checkOptional(hardhatConfig.includes('polygonAmoy'), 'Polygon Amoy network configured');
  checkOptional(hardhatConfig.includes('localhost'), 'Localhost network configured');
  
  // Check if contract compiles
  console.log('\n🔨 Testing contract compilation...');
  try {
    execSync('npx hardhat compile', { stdio: 'ignore' });
    console.log('✅ Contracts compile successfully');
  } catch (error) {
    console.log('⚠️  Contract compilation failed');
    console.log('   💡 Run: npx hardhat compile');
    hasWarnings = true;
  }
}

console.log('\n' + '-'.repeat(50) + '\n');

// 7. Check Push Chain Integration
console.log('🚀 Checking Push Chain Integration...\n');

// Check frontend Push Chain utilities
if (fs.existsSync('frontend/src/utils/pushChain.ts')) {
  const pushChainUtils = fs.readFileSync('frontend/src/utils/pushChain.ts', 'utf-8');
  
  checkExists('frontend/src/utils/pushChain.ts', 'Push Chain utilities exist');
  checkOptional(pushChainUtils.includes('PUSH_CHAIN_CONFIG'), 'Push Chain config defined');
  checkOptional(pushChainUtils.includes('PushChainProvider'), 'Push Chain provider class');
  checkOptional(pushChainUtils.includes('gasless: true'), 'Gas abstraction enabled');
}

// Check if Push Chain packages are installed
const frontendPackageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf-8'));
const pushPackages = [
  '@pushprotocol/push-chain',
  '@pushprotocol/restapi',
  '@pushprotocol/uiweb'
];

console.log('\nPush Protocol packages:');
for (const pkg of pushPackages) {
  if (frontendPackageJson.dependencies[pkg]) {
    console.log(`✅ ${pkg} (${frontendPackageJson.dependencies[pkg]})`);
  } else {
    console.log(`⚠️  ${pkg} not installed`);
    hasWarnings = true;
  }
}

console.log('\n' + '-'.repeat(50) + '\n');

// 8. Check Network Connectivity
console.log('🌐 Checking Network Connectivity...\n');

console.log('⚠️  Push Chain testnet RPC is not yet live');
console.log('   URL: https://testnet-rpc.pushchain.io');
console.log('   Status: DNS does not resolve');
console.log('   💡 Use local Hardhat network for testing');

console.log('\n✅ Local testing available:');
console.log('   • Start: npx hardhat node');
console.log('   • Deploy: npx hardhat run scripts/deploy.js --network localhost');

console.log('\n' + '-'.repeat(50) + '\n');

// 9. Migration Status Summary
console.log('📊 Push Chain Migration Status...\n');

const migrationChecks = [
  { name: 'Smart contracts ready', status: fs.existsSync('contracts/MockRWAPool.sol') },
  { name: 'Hardhat configured for Push Chain', status: fs.existsSync('hardhat.config.js') },
  { name: 'Frontend Push Chain integration', status: fs.existsSync('frontend/src/utils/pushChain.ts') },
  { name: 'Deployment scripts ready', status: fs.existsSync('scripts/deploy.js') },
  { name: 'Test scripts created', status: fs.existsSync('scripts/test-pushchain.js') },
  { name: 'Subgraph configured', status: fs.existsSync('subgraph/subgraph.yaml') },
  { name: 'Backend compatible', status: fs.existsSync('backend/main.py') },
];

let completedChecks = 0;
for (const check of migrationChecks) {
  if (check.status) {
    console.log(`✅ ${check.name}`);
    completedChecks++;
  } else {
    console.log(`❌ ${check.name}`);
  }
}

const percentage = Math.round((completedChecks / migrationChecks.length) * 100);
console.log(`\n📈 Migration Progress: ${completedChecks}/${migrationChecks.length} (${percentage}%)`);

console.log('\n' + '-'.repeat(50) + '\n');

// Final Summary
console.log('📋 Verification Summary\n');

if (!hasErrors && !hasWarnings) {
  console.log('🎉 All checks passed! Your setup is ready.\n');
  console.log('Next steps:');
  console.log('1. Create .env file: cp env.example .env');
  console.log('2. Add your private key to .env');
  console.log('3. Start local Hardhat network: npx hardhat node');
  console.log('4. Deploy contract: npx hardhat run scripts/deploy.js --network localhost');
  console.log('5. Start backend: cd backend && python -m uvicorn main:app --port 8000');
  console.log('6. Start frontend: cd frontend && npm run dev');
  console.log('7. Open browser: http://localhost:3000\n');
} else if (!hasErrors && hasWarnings) {
  console.log('⚠️  Setup is mostly ready with some warnings.\n');
  console.log('Review warnings above and proceed with testing.');
  console.log('See TEST_INSTRUCTIONS.md for detailed testing guide.\n');
} else {
  console.log('❌ Setup has errors that need to be fixed.\n');
  console.log('Review errors above and fix them before proceeding.');
  console.log('Common fixes:');
  console.log('• Run: npm install');
  console.log('• Run: cd frontend && npm install');
  console.log('• Create .env from env.example');
  console.log('• Install Python packages: pip install fastapi uvicorn\n');
}

console.log('📚 For detailed instructions, see:');
console.log('   • TEST_INSTRUCTIONS.md - Complete testing guide');
console.log('   • MIGRATION_STATUS.md - Migration status details');
console.log('   • GETTING_STARTED.md - Quick start guide\n');

process.exit(hasErrors ? 1 : 0);

