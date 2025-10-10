# 🧪 RWA-GPT Testing Guide

## Current Status

- ✅ Code is fully migrated to Push Chain
- ⚠️ Push Chain testnet is NOT yet live
- ✅ Can test locally using Hardhat network
- ✅ Can test on Polygon Amoy as alternative

---

## Option 1: Local Testing (RECOMMENDED)

### Prerequisites

1. Node.js 16+ installed
2. Python 3.11+ installed
3. MetaMask or compatible Web3 wallet

### Step 1: Setup Environment

```bash
# 1. Create .env file from template
cp env.example .env

# 2. Generate a test private key (DO NOT USE REAL FUNDS)
npx hardhat run scripts/setup.js
```

Edit `.env` and add:

```env
PRIVATE_KEY=your_generated_private_key_here
# Other keys are optional for local testing
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Python dependencies for backend
cd backend
pip install fastapi uvicorn python-dotenv requests pydantic
cd ..
```

### Step 3: Start Local Blockchain

**Terminal 1: Hardhat Node**

```bash
npx hardhat node
```

This starts a local Ethereum network on port 8545 with:

- 10 pre-funded test accounts
- Instant block mining
- Console logging of all transactions

### Step 4: Deploy Smart Contract Locally

**Terminal 2: Deploy Contract**

```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**

```
🚀 Starting deployment to Push Chain...
📦 Deploying MockRWAPool contract...
✅ Contract deployed successfully!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🌐 Network: localhost (Chain ID: 31337)
```

**IMPORTANT:** Copy the contract address for later use!

### Step 5: Start Backend Server

**Terminal 3: Backend**

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Expected Output:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 6: Start Frontend

**Terminal 4: Frontend**

```bash
cd frontend
npm run dev
```

**Expected Output:**

```
- Local:   http://localhost:3000
- Network: http://192.168.x.x:3000
```

### Step 7: Test in Browser

1. **Open Browser:** http://localhost:3000

2. **Connect MetaMask to Local Network:**

   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency: ETH

3. **Import Test Account:**

   - Copy private key from Terminal 1 (Hardhat node output)
   - Import into MetaMask
   - You should see 10000 ETH balance

4. **Test the Application:**
   - Click "Connect to Push Chain"
   - MetaMask will prompt to add/switch network (approve)
   - Type in chat: "show me investments"
   - Type: "invest 100 USDC in RE-001"
   - Click "Execute Swap" when transaction appears
   - Approve in MetaMask

### Expected Behavior

- ✅ Wallet connects successfully
- ✅ Chat interface responds with RWA investment options
- ✅ Can initiate investment transactions
- ✅ Transactions execute on local network
- ✅ Transaction history is tracked

---

## Option 2: Test with Polygon Amoy (Alternative)

If you want to test on a real testnet while waiting for Push Chain:

### Step 1: Update Hardhat Config Temporarily

Edit `hardhat.config.js` and set default network:

```javascript
module.exports = {
	defaultNetwork: "polygonAmoy",
	// ... rest of config
}
```

### Step 2: Get Test Tokens

1. **Get MATIC tokens:**

   - Visit: https://faucet.polygon.technology/
   - Enter your wallet address
   - Select "Polygon Amoy"
   - Request tokens

2. **Get test USDC:**
   - Use Polygon faucet or testnet DEX

### Step 3: Deploy to Polygon Amoy

```bash
npx hardhat run scripts/deploy.js --network polygonAmoy
```

### Step 4: Update Frontend Config

Edit `frontend/src/utils/pushChain.ts`:

```typescript
export const PUSH_CHAIN_CONFIG = {
	chainId: 80002, // Polygon Amoy
	chainName: "Polygon Amoy Testnet",
	rpcUrl: "https://rpc-amoy.polygon.technology/",
	// ... update other fields
}
```

### Step 5: Test Application

Follow steps 5-7 from Option 1, but:

- Connect MetaMask to Polygon Amoy
- Use real testnet tokens

---

## Option 3: Wait for Push Chain Testnet (Future)

When Push Chain testnet becomes available:

### Step 1: Verify Network is Live

```bash
# Test RPC endpoint
curl -X POST https://testnet-rpc.pushchain.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Step 2: Get Push Chain API Key

1. Visit: https://console.push.delivery
2. Register/Login
3. Create new app
4. Copy API key
5. Add to `.env`:
   ```env
   PUSHCHAIN_API_KEY=your_key_here
   ```

### Step 3: Get Test PUSH Tokens

- Check Push Chain documentation for faucet
- Or request from Push Protocol team

### Step 4: Deploy to Push Chain

```bash
npx hardhat run scripts/deploy.js --network pushchain
```

### Step 5: Update Subgraph

Edit `subgraph/subgraph.yaml`:

```yaml
source:
  address: "YOUR_DEPLOYED_CONTRACT_ADDRESS"
  startBlock: YOUR_DEPLOYMENT_BLOCK
```

Deploy subgraph:

```bash
cd subgraph
npm run codegen
npm run build
npm run deploy
```

### Step 6: Test Application

Same as Option 1, but with real Push Chain network!

---

## 🎯 Testing Checklist

### Smart Contract Testing

- [ ] Compile successfully: `npx hardhat compile`
- [ ] Deploy to local network
- [ ] Deploy to testnet (Polygon Amoy or Push Chain)
- [ ] Test investment function
- [ ] Test yield distribution
- [ ] Verify events emitted

### Frontend Testing

- [ ] Connect wallet successfully
- [ ] Switch network automatically
- [ ] Chat interface responds
- [ ] Display investment options
- [ ] Execute transactions
- [ ] Track transaction status
- [ ] Display transaction history
- [ ] Gas abstraction message shows (on Push Chain)

### Backend Testing

- [ ] API server starts: `http://localhost:8000`
- [ ] `/health` endpoint works
- [ ] `/ask-agent` responds to queries
- [ ] Real estate data fetches
- [ ] Transaction storage works
- [ ] Transaction status updates
- [ ] CORS allows frontend requests

### Integration Testing

- [ ] Frontend → Backend communication
- [ ] Backend → 1inch API integration
- [ ] Wallet → Smart Contract interaction
- [ ] Transaction → Backend storage
- [ ] Chat → Transaction execution flow

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'ethers'"

**Solution:** Run `npm install` in root and frontend directories

### Issue: "Private key not found"

**Solution:** Create `.env` file with your private key (never commit this!)

### Issue: "Connection refused on port 8000"

**Solution:** Start backend server: `cd backend && python -m uvicorn main:app --port 8000`

### Issue: "Network not found in MetaMask"

**Solution:** The app will prompt to add network automatically. Click "Approve"

### Issue: "Insufficient funds for gas"

**Solution:**

- Local: Import Hardhat test account with 10000 ETH
- Testnet: Get tokens from faucet

### Issue: "Contract not deployed"

**Solution:** Run deployment script: `npx hardhat run scripts/deploy.js --network localhost`

### Issue: "Transaction reverted"

**Solution:** Check console logs, ensure:

- Contract is deployed
- You have sufficient balance
- Gas limit is adequate

---

## 📊 Performance Testing

### Load Testing

```bash
# Test backend with multiple requests
for i in {1..10}; do
  curl -X POST http://localhost:8000/ask-agent \
    -H "Content-Type: application/json" \
    -d '{"message":"show investments","chainId":80002}'
done
```

### Gas Usage Testing

```bash
# Test gas consumption
npx hardhat run scripts/test-pushchain.js --network localhost
```

---

## 🎉 Success Criteria

Your application is working correctly if:

✅ **Wallet Connection:**

- MetaMask connects without errors
- Network switches automatically
- Balance displays correctly

✅ **Chat Interface:**

- AI responds to queries
- Shows relevant investment options
- Formats responses properly

✅ **Transaction Execution:**

- Transactions execute successfully
- Transaction hash is generated
- Status updates from pending → confirmed
- Transaction history shows correctly

✅ **Real-time Data:**

- Investment options update
- APY rates display
- Property information loads

✅ **Error Handling:**

- Clear error messages
- Graceful fallbacks
- No console errors

---

## 📚 Additional Resources

- **Hardhat Documentation:** https://hardhat.org/docs
- **Push Protocol Docs:** https://docs.push.org/
- **MetaMask Developer Docs:** https://docs.metamask.io/
- **The Graph Documentation:** https://thegraph.com/docs/
- **1inch API Docs:** https://docs.1inch.io/

---

## 🚀 Next Steps After Testing

1. **Document Issues:** Note any bugs or issues found
2. **Optimize Gas:** Review transaction gas usage
3. **Improve UX:** Enhance user experience based on testing
4. **Security Audit:** Review smart contracts for vulnerabilities
5. **Performance Optimization:** Optimize API response times
6. **Monitor Push Chain:** Watch for testnet announcement
7. **Deploy to Production:** When ready, deploy to Push Chain mainnet

---

**Remember:** Since Push Chain testnet is not live, local testing is your best option right now. The code is ready; we're just waiting for the network! 🚀
