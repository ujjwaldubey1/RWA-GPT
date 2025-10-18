# 🔧 Phantom Wallet Troubleshooting Guide

## 🎯 Problem: App Still Connecting to MetaMask Instead of Phantom

If your application is still connecting to MetaMask instead of Phantom, follow this troubleshooting guide to ensure Phantom is properly prioritized.

## 🔍 Step 1: Check Phantom Installation & Mode

### **Verify Phantom Installation**

1. **Check Browser Extensions**:
   - Open your browser's extension manager
   - Ensure Phantom is installed and enabled
   - Visit [phantom.app](https://phantom.app) to install if needed

### **Verify Ethereum Mode**

1. **Open Phantom**: Click the Phantom extension icon
2. **Check Network Selector**: Look at the top of the Phantom window
3. **Switch to Ethereum**: If you see "Solana", click it and select "Ethereum"
4. **Confirm**: You should see Ethereum networks (Mainnet, Sepolia, etc.)

## 🔍 Step 2: Use the Debug Feature

### **Built-in Debug Tool**

1. **Open Your App**: Navigate to your RWA-GPT application
2. **Click Debug**: Click the "🔍 Debug Wallets" button in the sidebar
3. **Check Console**: Open browser console (F12) to see detailed wallet detection info
4. **Review Results**: Look for Phantom detection status

### **Manual Console Check**

Open browser console (F12) and run:

```javascript
console.log("Phantom Detection:", {
	ethereum: !!window.ethereum,
	phantom: window.ethereum?.isPhantom,
	metamask: window.ethereum?.isMetaMask,
	providers: window.ethereum?.providers?.length || 0,
})
```

## 🔧 Step 3: Force Phantom Usage

### **Method 1: Browser Refresh**

1. **Close All Tabs**: Close all browser tabs with your app
2. **Disable MetaMask**: Temporarily disable MetaMask extension
3. **Refresh**: Open your app in a new tab
4. **Connect**: Try connecting - should now use Phantom

### **Method 2: Clear Browser Data**

1. **Clear Site Data**:
   - Open browser settings
   - Go to Privacy/Security
   - Clear site data for your app domain
2. **Restart Browser**: Close and reopen browser
3. **Try Again**: Connect to your app

### **Method 3: Use Incognito Mode**

1. **Open Incognito**: Open browser in incognito/private mode
2. **Install Phantom**: Install only Phantom in incognito mode
3. **Test Connection**: Try connecting to your app

## 🔧 Step 4: Advanced Configuration

### **Manual Provider Selection**

If the automatic detection isn't working, you can manually select Phantom:

```javascript
// Run this in browser console before connecting
if (window.ethereum?.providers) {
	const phantom = window.ethereum.providers.find((p) => p.isPhantom)
	if (phantom) {
		window.ethereum = phantom
		console.log("✅ Manually selected Phantom")
	}
}
```

### **Disable MetaMask Temporarily**

1. **Extension Manager**: Go to browser extensions
2. **Disable MetaMask**: Turn off MetaMask extension
3. **Test Connection**: Try connecting with only Phantom
4. **Re-enable**: Turn MetaMask back on after testing

## 🔧 Step 5: Verify Network Configuration

### **Add Polygon Amoy to Phantom**

1. **Open Phantom**: Make sure you're in Ethereum mode
2. **Settings**: Click the gear icon
3. **Networks**: Go to "Networks" or "Ethereum Networks"
4. **Add Network**: Add these details:
   - **Name**: `Polygon Amoy Testnet`
   - **RPC URL**: `https://rpc-amoy.polygon.technology/`
   - **Chain ID**: `80002`
   - **Currency**: `MATIC`
   - **Explorer**: `https://amoy.polygonscan.com`

### **Get Test MATIC**

1. **Visit Faucet**: Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. **Connect Phantom**: Connect your Phantom wallet
3. **Request MATIC**: Get test MATIC tokens

## 🚨 Common Issues & Solutions

### **Issue 1: "Phantom not detected"**

**Solution:**

- Ensure Phantom is installed and enabled
- Check that Phantom is in Ethereum mode
- Try refreshing the page

### **Issue 2: "Multiple wallets detected"**

**Solution:**

- The app should prioritize Phantom automatically
- Use the debug tool to check detection
- Try disabling MetaMask temporarily

### **Issue 3: "Connection rejected"**

**Solution:**

- Check Phantom is unlocked
- Ensure you're on the correct network
- Try connecting again

### **Issue 4: "Network not found"**

**Solution:**

- Add Polygon Amoy network to Phantom
- Switch Phantom to Ethereum mode
- Refresh the page

## 🔍 Debug Information

### **Expected Console Output**

When working correctly, you should see:

```
🔍 Detecting wallets...
🔍 Available providers: [Array of providers]
🔍 Primary provider flags: {isPhantom: true, isMetaMask: false, ...}
✅ Phantom wallet detected
🎯 Selected wallet: phantom
🔗 Connecting to Phantom...
✅ Phantom connected: 0x...
```

### **If MetaMask is Selected Instead**

You'll see:

```
⚠️ MetaMask detected as fallback (Phantom not found)
🎯 Selected wallet: metamask
```

## 🎯 Testing Checklist

### **Before Testing:**

- [ ] Phantom installed and enabled
- [ ] Phantom in Ethereum mode
- [ ] Polygon Amoy network added
- [ ] Test MATIC tokens available

### **During Testing:**

- [ ] Use debug tool to check detection
- [ ] Check console for wallet selection logs
- [ ] Verify connection shows Phantom address
- [ ] Test transaction execution

### **After Testing:**

- [ ] Phantom address displayed correctly
- [ ] Network shows "Polygon Amoy"
- [ ] Transactions work properly
- [ ] Balance shows MATIC tokens

## 🆘 Still Having Issues?

### **Contact Support:**

1. **Check Console Logs**: Copy any error messages from browser console
2. **Screenshot Debug Info**: Take screenshot of debug tool output
3. **Browser Information**: Note your browser and version
4. **Extension Status**: List all installed wallet extensions

### **Alternative Solutions:**

1. **Use Different Browser**: Try Chrome, Firefox, or Edge
2. **Update Phantom**: Ensure you have the latest version
3. **Reset Phantom**: Clear Phantom's data and re-setup
4. **Fresh Install**: Uninstall and reinstall Phantom

## 🎉 Success Indicators

You'll know Phantom is working correctly when:

- ✅ Debug tool shows "Phantom in Ethereum mode: ✅"
- ✅ Console shows "🎯 Selected wallet: phantom"
- ✅ Connect button shows "👻 Connect Phantom"
- ✅ Wallet address starts with 0x (Ethereum format)
- ✅ Network shows "Polygon Amoy"
- ✅ Transactions execute successfully

---

**Remember**: The app is designed to automatically prioritize Phantom over MetaMask. If it's still using MetaMask, there's likely a detection issue that can be resolved using the steps above.

