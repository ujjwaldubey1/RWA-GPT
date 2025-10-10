# 🚀 Getting Started with Push Chain Migration

This guide will help you set up and run your RWA-GPT application on Push Chain.

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- A Web3 wallet (MetaMask recommended)
- Git

## 🔧 Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install subgraph dependencies
cd subgraph
npm install
cd ..
```

### 2. Generate Private Key and Setup Environment

```bash
# Run the setup script
npx hardhat run scripts/setup.js

# This will:
# - Generate a new private key
# - Create .env file with configuration
# - Test network connections
```

### 3. Get Required API Keys

#### **Private Key (Required)**

The setup script generates one for you, or you can:

- Export from MetaMask: Account Details > Export Private Key
- Generate new: `npx hardhat generate-account`

#### **Push Chain API Key (Optional)**

1. Visit: https://console.push.delivery
2. Register/Login
3. Create a new app
4. Copy the API key from "Notification + Admin API" section
5. Add to your `.env` file

#### **Test PUSH Tokens (Required for testing)**

Since Push Chain testnet is in development:

- Check for official faucet
- Contact Push Protocol team for testnet access
- Use existing testnet tokens if available

## 🚀 Deployment Steps

### 1. Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Push Chain testnet
npx hardhat run scripts/deploy.js --network pushchain
```

### 2. Update Subgraph Configuration

After deployment, update `subgraph/subgraph.yaml`:

```yaml
source:
  address: "YOUR_DEPLOYED_CONTRACT_ADDRESS"
  startBlock: YOUR_DEPLOYMENT_BLOCK_NUMBER
```

### 3. Deploy Subgraph

```bash
cd subgraph
npm run codegen
npm run build
npm run deploy
cd ..
```

### 4. Start the Application

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

## 🧪 Testing

### Test Contract Deployment

```bash
npx hardhat run scripts/test-pushchain.js --network pushchain
```

### Test Frontend Integration

1. Open http://localhost:3000
2. Click "Connect to Push Chain"
3. Add Push Chain network if prompted
4. Test investment transactions

## 🔗 Push Chain Network Details

- **Network Name**: Push Chain Testnet
- **Chain ID**: 1001
- **RPC URL**: https://testnet-rpc.pushchain.io
- **Block Explorer**: https://testnet-explorer.pushchain.io
- **Native Token**: PUSH
- **Gas Abstraction**: Enabled

## 🛠️ Troubleshooting

### Common Issues

#### "Push Chain network not found"

- The app will automatically prompt to add Push Chain network
- Make sure you're using a compatible wallet

#### "Transaction failed"

- Ensure you're connected to Push Chain testnet
- Check if you have test PUSH tokens
- Verify gas abstraction is working

#### "Contract not verified"

- Run: `npx hardhat verify --network pushchain <CONTRACT_ADDRESS>`
- Make sure you have the correct API key

#### "Subgraph not indexing"

- Update contract address in `subgraph.yaml`
- Redeploy subgraph with correct configuration

### Getting Help

1. **Check the logs** for detailed error messages
2. **Verify network connection** to Push Chain
3. **Ensure all dependencies** are installed
4. **Check environment variables** in `.env` file

## 📚 Additional Resources

- **Push Protocol Docs**: https://docs.push.org/
- **Push Chain Console**: https://console.push.delivery
- **Migration Guide**: [PUSH_CHAIN_MIGRATION.md](./PUSH_CHAIN_MIGRATION.md)

## 🎯 What's Next?

1. **Deploy to Push Chain mainnet** when available
2. **Integrate Push Protocol notifications**
3. **Add more cross-chain features**
4. **Implement advanced gas abstraction**

## ⚠️ Important Notes

- **Never share your private key**
- **Never commit `.env` file to version control**
- **Use testnet only for development**
- **Keep your private key secure**

## 🎉 Success!

Once everything is set up, you'll have:

- ✅ Gas-free transactions through abstraction
- ✅ Cross-chain compatibility
- ✅ Enhanced user experience
- ✅ Universal dApp reach

Your RWA-GPT application is now powered by Push Chain! 🚀

