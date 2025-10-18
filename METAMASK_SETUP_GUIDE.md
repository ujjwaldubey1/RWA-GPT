# 🦊 MetaMask Setup Guide for Push Chain

This guide will help you set up MetaMask to work with your RWA-GPT application on Push Chain.

---

## 🚨 Important: Why MetaMask?

**Phantom ❌** = Solana wallet (not compatible with Push Chain)  
**MetaMask ✅** = Ethereum wallet (compatible with Push Chain)

**Push Chain is EVM-compatible** (like Ethereum), so it requires an Ethereum wallet like MetaMask.

---

## 📥 Step 1: Install MetaMask

### **Download MetaMask:**

1. Visit: https://metamask.io
2. Click **"Download"**
3. Select your browser (Chrome, Firefox, Edge, etc.)
4. Click **"Install MetaMask for [Your Browser]"**
5. Click **"Add to [Browser]"**

### **Create or Import Wallet:**

**Option A: Create New Wallet**

1. Click **"Create a new wallet"**
2. Set a strong password
3. **IMPORTANT:** Save your recovery phrase securely
4. Confirm your recovery phrase
5. Done! 🎉

**Option B: Import Existing Wallet**

1. Click **"Import an existing wallet"**
2. Enter your recovery phrase (12 words)
3. Set a password
4. Done! 🎉

---

## 🔧 Step 2: Add Push Chain Network

The application will automatically prompt you to add Push Chain, but here's how to do it manually:

### **Automatic (Recommended):**

1. Open your app: http://localhost:3000
2. Click **"🦊 Connect MetaMask"**
3. MetaMask will prompt: **"Allow this site to add a network?"**
4. Click **"Approve"**
5. Click **"Switch network"**
6. Done! ✅

### **Manual Method:**

1. Open MetaMask
2. Click the **network dropdown** (top center)
3. Click **"Add network"**
4. Click **"Add a network manually"**
5. Enter these details:

```
Network Name: Push Chain Testnet
RPC URL: https://rpc.push.org
Chain ID: 1001
Currency Symbol: PC
Block Explorer URL: https://donut.push.network
```

6. Click **"Save"**
7. Click **"Switch to Push Chain Testnet"**
8. Done! ✅

---

## 🔑 Step 3: Import Your Push Chain Account

You need to import the account that has PC tokens.

### **Your Push Chain Address:**

```
0xBD6CA86C169af89720fcAD0b5595EE46eE4BaA52
```

### **Import Steps:**

1. Open MetaMask
2. Click the **account icon** (top right)
3. Click **"Import Account"**
4. Select **"Private Key"**
5. Enter the **private key** for address `0xBD6CA86C169af89720fcAD0b5595EE46eE4BaA52`
6. Click **"Import"**

**✅ You should now see your 8 PC tokens!**

---

## 🧪 Step 4: Test the Application

### **1. Open the Application:**

```
http://localhost:3000
```

### **2. Connect MetaMask:**

- Click **"🦊 Connect MetaMask"** button
- MetaMask will pop up
- Click **"Next"**
- Click **"Connect"**
- If prompted, approve network switch to Push Chain

### **3. Test Features:**

```
✅ Type: "show me investments"
✅ Type: "invest 1 PC in RE-001"
✅ Test gas abstraction (no gas fees!)
```

---

## 🐛 Troubleshooting

### **Issue: "Phantom wallet detected"**

**Solution:**

1. **Disable Phantom temporarily:**
   - Click Phantom extension icon
   - Click Settings
   - Toggle off or remove extension
2. **Or install MetaMask:**
   - MetaMask will be prioritized automatically
   - Restart browser
   - Try connecting again

---

### **Issue: "Multiple wallets detected"**

**Solution:**

- The code is updated to automatically select MetaMask
- If issues persist, disable other wallets temporarily
- MetaMask will be prioritized

---

### **Issue: "Failed to add Push Chain network"**

**Solution:**

1. **Try different RPC URLs:**
   ```
   https://rpc.push.org
   https://testnet-rpc.push.org
   https://rpc-testnet.push.org
   ```
2. Check Push Protocol Discord for latest RPC
3. Add network manually (see Step 2 above)

---

### **Issue: "No accounts found"**

**Solution:**

1. Make sure MetaMask is unlocked
2. Import the account with PC tokens
3. Refresh the page
4. Try connecting again

---

### **Issue: "Can't find private key"**

**Options:**

**If you created the address in MetaMask:**

1. Open MetaMask
2. Click account menu → Account details
3. Click **"Show private key"**
4. Enter MetaMask password
5. Copy private key (use carefully!)

**If you created it elsewhere:**

1. Check your wallet backup
2. Check where you originally created it
3. Never share your private key with anyone!

---

## 🎯 Quick Checklist

Before testing, make sure:

- [ ] ✅ MetaMask installed
- [ ] ✅ Push Chain network added (Chain ID: 1001)
- [ ] ✅ Account with PC tokens imported
- [ ] ✅ MetaMask is unlocked
- [ ] ✅ Connected to Push Chain network
- [ ] ✅ Can see PC balance (8 PC)
- [ ] ✅ Frontend running (http://localhost:3000)
- [ ] ✅ Backend running (http://localhost:8000)

---

## 🔒 Security Tips

### **DO:**

✅ Keep your recovery phrase safe and offline  
✅ Use a strong password for MetaMask  
✅ Only use testnet tokens for testing  
✅ Verify network before transactions

### **DON'T:**

❌ Share your private key or recovery phrase  
❌ Screenshot your private key  
❌ Use mainnet funds for testing  
❌ Connect to unknown websites

---

## 🚀 What to Expect After Setup

Once MetaMask is connected:

✅ **Wallet Status:**

- Shows your address (0xBD6CA...)
- Shows 8 PC balance
- Shows "Push Chain" network

✅ **Application Features:**

- Chat with AI about RWA investments
- View real-time investment options
- Execute transactions with gas abstraction
- Track transaction history

✅ **Gas Abstraction:**

- Transactions are FREE on Push Chain
- No gas fees required
- Seamless user experience

---

## 📚 Additional Resources

- **MetaMask Support:** https://support.metamask.io
- **Push Chain Faucet:** https://faucet.push.org
- **Push Chain Explorer:** https://donut.push.network
- **Push Protocol Discord:** https://discord.gg/pushprotocol

---

## 🎉 Success!

Once everything is set up:

1. Open: http://localhost:3000
2. Click: "🦊 Connect MetaMask"
3. Start chatting with your RWA AI agent!

**Your RWA-GPT application is now connected to Push Chain via MetaMask!** 🚀

---

**Need Help?** Check the troubleshooting section above or review the browser console for error messages.



