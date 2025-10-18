#!/usr/bin/env node

/**
 * Start Local Testing Environment
 * Since Push Chain RPC is not available, test locally
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🏠 Starting Local Testing Environment\n');
console.log('='.repeat(60) + '\n');

console.log('🎯 Why Local Testing?');
console.log('   • Push Chain RPC endpoints are not accessible');
console.log('   • Local testing gives you instant 10,000 ETH');
console.log('   • Test all features without waiting for Push Chain');
console.log('   • Same code, different network\n');

console.log('🚀 Starting services...\n');

// Terminal 1: Start Hardhat node
console.log('1️⃣  Starting Hardhat node...');
const hardhatNode = spawn('npx', ['hardhat', 'node'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

hardhatNode.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
    console.log('✅ Hardhat node started on http://localhost:8545');
    
    // Terminal 2: Deploy contract
    setTimeout(() => {
      console.log('\n2️⃣  Deploying contract...');
      const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], {
        cwd: __dirname,
        stdio: 'pipe',
        shell: true
      });
      
      deployProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        if (output.includes('Contract deployed successfully!')) {
          console.log('✅ Contract deployed locally');
          
          // Terminal 3: Start backend
          setTimeout(() => {
            console.log('\n3️⃣  Starting backend...');
            const backendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
              cwd: path.join(__dirname, 'backend'),
              stdio: 'pipe',
              shell: true
            });
            
            backendProcess.stdout.on('data', (data) => {
              const output = data.toString();
              if (output.includes('Uvicorn running')) {
                console.log('✅ Backend started on http://localhost:8000');
                
                // Terminal 4: Start frontend
                setTimeout(() => {
                  console.log('\n4️⃣  Starting frontend...');
                  const frontendProcess = spawn('npm', ['run', 'dev'], {
                    cwd: path.join(__dirname, 'frontend'),
                    stdio: 'pipe',
                    shell: true
                  });
                  
                  frontendProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('Local:')) {
                      console.log('✅ Frontend started on http://localhost:3000');
                      
                      console.log('\n' + '='.repeat(60));
                      console.log('\n🎉 ALL SERVICES RUNNING!\n');
                      
                      console.log('📋 Your Local Testing Environment:');
                      console.log('   • Hardhat Node: http://localhost:8545');
                      console.log('   • Contract: Deployed locally');
                      console.log('   • Backend API: http://localhost:8000');
                      console.log('   • Frontend: http://localhost:3000');
                      
                      console.log('\n🧪 HOW TO TEST:\n');
                      console.log('1. Open: http://localhost:3000');
                      console.log('2. In MetaMask:');
                      console.log('   • Network: Localhost 8545');
                      console.log('   • RPC URL: http://localhost:8545');
                      console.log('   • Chain ID: 31337');
                      console.log('   • Currency: ETH');
                      console.log('3. Import Hardhat account (check Terminal 1 output)');
                      console.log('4. You should see 10,000 ETH balance');
                      console.log('5. Click "🦊 Connect MetaMask"');
                      console.log('6. Test the application!');
                      
                      console.log('\n💡 BENEFITS:');
                      console.log('   ✅ No RPC issues');
                      console.log('   ✅ Instant transactions');
                      console.log('   ✅ Free test ETH');
                      console.log('   ✅ Test all features');
                      
                      console.log('\n🎯 Next: Open http://localhost:3000 and test!\n');
                    }
                  });
                  
                  frontendProcess.stderr.on('data', (data) => {
                    console.log('Frontend error:', data.toString());
                  });
                }, 2000);
              }
            });
            
            backendProcess.stderr.on('data', (data) => {
              console.log('Backend error:', data.toString());
            });
          }, 2000);
        }
      });
      
      deployProcess.stderr.on('data', (data) => {
        console.log('Deploy error:', data.toString());
      });
    }, 3000);
  }
});

hardhatNode.stderr.on('data', (data) => {
  console.log('Hardhat error:', data.toString());
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping all services...');
  hardhatNode.kill();
  process.exit(0);
});

console.log('⏳ Starting services... (this may take a few seconds)');
console.log('Press Ctrl+C to stop all services\n');




