import { ethers } from 'ethers';

// Polygon Amoy Testnet Configuration
export const POLYGON_CONFIG = {
  chainId: 80002, // Polygon Amoy Testnet
  chainName: 'Polygon Amoy Testnet',
  rpcUrl: 'https://rpc-amoy.polygon.technology/',
  blockExplorerUrl: 'https://amoy.polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  // Gas settings for Polygon
  gasless: false,
  metaTransactions: false,
};

// Polygon Mainnet Configuration (for future use)
export const POLYGON_MAINNET_CONFIG = {
  chainId: 137,
  chainName: 'Polygon Mainnet',
  rpcUrl: 'https://polygon-rpc.com/',
  blockExplorerUrl: 'https://polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  gasless: false,
  metaTransactions: false,
};

// Polygon Network Details for Wallet Connection
export const POLYGON_NETWORK = {
  chainId: `0x${POLYGON_CONFIG.chainId.toString(16)}`, // 0x13882
  chainName: POLYGON_CONFIG.chainName,
  nativeCurrency: POLYGON_CONFIG.nativeCurrency,
  rpcUrls: [POLYGON_CONFIG.rpcUrl],
  blockExplorerUrls: [POLYGON_CONFIG.blockExplorerUrl],
};

// Polygon Provider Class
export class PolygonProvider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private address: string | null = null;

  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }

  // Initialize Polygon connection with MetaMask first, then fallback to other wallets
  async connect(): Promise<{
    address: string;
    provider: ethers.BrowserProvider;
    signer: ethers.JsonRpcSigner;
  }> {
    console.log('🔍 Detecting wallets...');
    
    // Check for Phantom (Solana mode) first - show helpful error
    if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
      throw new Error('⚠️ Phantom detected in Solana mode!\n\nPlease switch Phantom to Ethereum mode to connect to Polygon.\n\n✅ How to switch:\n1. Open Phantom wallet\n2. Click the network selector\n3. Switch to "Ethereum"\n4. Try connecting again');
    }
    
    // Check for Ethereum provider
    if (typeof window.ethereum === 'undefined') {
      throw new Error('❌ No Ethereum wallet found!\n\n✅ Please install MetaMask:\n→ https://metamask.io\n\nOr install Phantom:\n→ https://phantom.app');
    }

    let ethereum = window.ethereum;
    let selectedWallet = 'unknown';

    // Debug: Log all available providers
    console.log('🔍 Available providers:', window.ethereum.providers);
    console.log('🔍 Primary provider flags:', {
      isMetaMask: window.ethereum.isMetaMask,
      isPhantom: window.ethereum.isPhantom,
      isBraveWallet: window.ethereum.isBraveWallet,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet
    });

    // If multiple wallets are installed, prioritize MetaMask first, then others
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      console.log('🔍 Multiple wallets detected, searching for MetaMask first...');
      
      // First priority: MetaMask
      const metamaskProvider = window.ethereum.providers.find(
        (provider: unknown) => (provider as { isMetaMask?: boolean }).isMetaMask
      ) as typeof window.ethereum;
      
      if (metamaskProvider) {
        ethereum = metamaskProvider;
        selectedWallet = 'metamask';
        console.log('✅ MetaMask detected and selected from multiple providers');
      } else {
        // Second priority: Phantom (Ethereum mode)
        const phantomProvider = window.ethereum.providers.find((provider: unknown) => {
          const p = provider as { isPhantom?: boolean; isBraveWallet?: boolean; constructor?: { name?: string } };
          console.log('🔍 Checking provider:', {
            isPhantom: p.isPhantom,
            isBraveWallet: p.isBraveWallet,
            constructor: p.constructor?.name
          });
          return p.isPhantom || p.isBraveWallet || 
                 p.constructor?.name?.toLowerCase().includes('phantom');
        }) as typeof window.ethereum;
        
        if (phantomProvider) {
          ethereum = phantomProvider;
          selectedWallet = 'phantom';
          console.log('✅ Phantom detected as fallback (MetaMask not found)');
        } else {
          // Third priority: Coinbase Wallet
          const coinbaseProvider = window.ethereum.providers.find(
            (provider: unknown) => (provider as { isCoinbaseWallet?: boolean }).isCoinbaseWallet
          ) as typeof window.ethereum;
          
          if (coinbaseProvider) {
            ethereum = coinbaseProvider;
            selectedWallet = 'coinbase';
            console.log('✅ Coinbase Wallet detected as fallback');
          } else {
            // Use the first available provider
            ethereum = window.ethereum.providers[0] as typeof window.ethereum;
            selectedWallet = 'other';
            console.log('⚠️ Using first available wallet provider');
          }
        }
      }
    } else {
      // Single wallet provider - check what it is
      if (window.ethereum.isMetaMask) {
        selectedWallet = 'metamask';
        console.log('✅ MetaMask detected (single provider)');
      } else if (window.ethereum.isPhantom || window.ethereum.isBraveWallet) {
        selectedWallet = 'phantom';
        console.log('✅ Phantom wallet detected (single provider)');
      } else if (window.ethereum.isCoinbaseWallet) {
        selectedWallet = 'coinbase';
        console.log('✅ Coinbase Wallet detected (single provider)');
      } else {
        selectedWallet = 'other';
        console.log('✅ Other wallet detected (single provider)');
      }
    }

    console.log(`🎯 Selected wallet: ${selectedWallet}`);

    try {
      const walletName = selectedWallet === 'metamask' ? 'MetaMask' : 
                        selectedWallet === 'phantom' ? 'Phantom' :
                        selectedWallet === 'coinbase' ? 'Coinbase Wallet' : 'wallet';
      
      console.log(`🔗 Connecting to ${walletName}...`);
      
      // Ensure ethereum is defined
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error(`No accounts found. Please unlock ${walletName}.`);
      }
      
      console.log(`✅ ${walletName} connected:`, accounts[0]);
      
      // Try to switch to Polygon network
      try {
        console.log('🔄 Switching to Polygon Amoy network...');
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POLYGON_NETWORK.chainId }],
        });
        console.log('✅ Switched to Polygon Amoy');
      } catch (switchError: unknown) {
        // If switch fails, try to add the network
        if ((switchError as { code?: number }).code === 4902 || (switchError as { code?: number }).code === -32603) {
          console.log('➕ Adding Polygon Amoy network to wallet...');
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [POLYGON_NETWORK],
            });
            console.log('✅ Polygon Amoy network added');
          } catch (addError: unknown) {
            const errorMessage = addError instanceof Error ? addError.message : 'Unknown error';
            throw new Error(`Failed to add Polygon Amoy network: ${errorMessage}`);
          }
        } else if ((switchError as { code?: number }).code === 4001) {
          throw new Error(`Connection rejected. Please approve the network switch in ${walletName}.`);
        } else {
          throw switchError;
        }
      }

      // Create provider and get signer using the selected ethereum provider
      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      
      console.log(`🎉 Successfully connected to Polygon via ${walletName}!`);

      return {
        address: this.address,
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error: unknown) {
      console.error('❌ Polygon connection failed:', error);
      
      // Provide user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('User rejected')) {
        throw new Error('Connection rejected. Please approve the connection in your wallet.');
      } else if (errorMessage.includes('Already processing')) {
        throw new Error('Wallet is busy. Please check your wallet and try again.');
      }
      
      throw error;
    }
  }

  // Get current network
  async getNetwork() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return await this.provider.getNetwork();
  }

  // Check if connected to Polygon
  async isConnectedToPolygon(): Promise<boolean> {
    try {
      const network = await this.getNetwork();
      return Number(network.chainId) === POLYGON_CONFIG.chainId;
    } catch {
      return false;
    }
  }

  // Execute transaction on Polygon
  async executeTransaction(transaction: {
    to: string;
    value?: string;
    data?: string;
    gasLimit?: string;
  }) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    // Check if we're on Polygon
    const isOnPolygon = await this.isConnectedToPolygon();
    if (!isOnPolygon) {
      throw new Error('Please switch to Polygon Amoy network');
    }

    try {
      // For Polygon, we use standard gas fees
      const txResponse = await this.signer.sendTransaction({
        to: transaction.to,
        value: transaction.value || '0x0',
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit || '0x5208',
      });

      return txResponse;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Get account balance
  async getBalance(): Promise<string> {
    if (!this.provider || !this.address) {
      throw new Error('Provider not initialized');
    }
    
    const balance = await this.provider.getBalance(this.address);
    return ethers.formatEther(balance);
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }

  // Get current address
  getAddress(): string | null {
    return this.address;
  }

  // Get current provider
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  // Get current signer
  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
}

// Export singleton instance
export const polygonProvider = new PolygonProvider();

// Utility function to detect available wallets
export const detectAvailableWallets = () => {
  if (typeof window === 'undefined') return [];
  
  const wallets = [];
  
  if (window.ethereum?.isMetaMask) {
    wallets.push('MetaMask');
  }
  if (window.ethereum?.isPhantom) {
    wallets.push('Phantom');
  }
  if (window.ethereum?.isCoinbaseWallet) {
    wallets.push('Coinbase Wallet');
  }
  if (window.ethereum?.isBraveWallet) {
    wallets.push('Brave Wallet');
  }
  
  return wallets;
};

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  if (num < 0.001) return '< 0.001 MATIC';
  return `${num.toFixed(4)} MATIC`;
};

// Polygon specific error messages
export const POLYGON_ERRORS = {
  NETWORK_NOT_FOUND: 'Polygon Amoy network not found. Please add it to your wallet.',
  USER_REJECTED: 'Transaction rejected by user',
  INSUFFICIENT_FUNDS: 'Insufficient funds for gas fees',
  WRONG_NETWORK: 'Please switch to Polygon Amoy network',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
};
