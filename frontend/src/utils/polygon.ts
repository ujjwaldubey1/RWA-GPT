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

  // Initialize Polygon connection with MetaMask
  async connect(): Promise<{
    address: string;
    provider: ethers.BrowserProvider;
    signer: ethers.JsonRpcSigner;
  }> {
    // Detect and prioritize MetaMask over other wallets
    let ethereum = window.ethereum;
    
    // Check for MetaMask specifically
    if (typeof window.ethereum === 'undefined') {
      // Check for Phantom (Solana wallet)
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        throw new Error('⚠️ Phantom wallet detected!\n\nPhantom is a Solana wallet and does not support Polygon (Ethereum-compatible).\n\n✅ Please install MetaMask:\n→ https://metamask.io\n\nOr disable Phantom and use an Ethereum wallet.');
      }
      throw new Error('❌ No Ethereum wallet found!\n\n✅ Please install MetaMask:\n→ https://metamask.io\n\nMetaMask is required to connect to Polygon.');
    }

    // If multiple wallets are installed, prefer MetaMask
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metamaskProvider = window.ethereum.providers.find(
        (provider: any) => provider.isMetaMask
      ) as any;
      
      if (metamaskProvider) {
        ethereum = metamaskProvider;
        console.log('✅ MetaMask detected and selected');
      } else {
        // No MetaMask found in providers
        throw new Error('⚠️ Multiple wallets detected but MetaMask not found!\n\n✅ Please install MetaMask:\n→ https://metamask.io\n\nOr make sure MetaMask is enabled.');
      }
    } else if (!window.ethereum.isMetaMask) {
      // Single wallet provider but it's not MetaMask
      const walletName = window.ethereum.isPhantom ? 'Phantom' : 
                        window.ethereum.isCoinbaseWallet ? 'Coinbase Wallet' : 
                        'Unknown wallet';
      
      throw new Error(`⚠️ ${walletName} detected!\n\nPolygon requires MetaMask for best compatibility.\n\n✅ Please install MetaMask:\n→ https://metamask.io\n\nOr temporarily disable ${walletName}.`);
    }

    try {
      console.log('🔗 Connecting to MetaMask...');
      
      // Ensure ethereum is defined
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }
      
      console.log('✅ MetaMask connected:', accounts[0]);
      
      // Try to switch to Polygon network
      try {
        console.log('🔄 Switching to Polygon Amoy network...');
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POLYGON_NETWORK.chainId }],
        });
        console.log('✅ Switched to Polygon Amoy');
      } catch (switchError: any) {
        // If switch fails, try to add the network
        if (switchError.code === 4902 || switchError.code === -32603) {
          console.log('➕ Adding Polygon Amoy network to MetaMask...');
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [POLYGON_NETWORK],
            });
            console.log('✅ Polygon Amoy network added');
          } catch (addError: any) {
            throw new Error(`Failed to add Polygon Amoy network: ${addError.message}`);
          }
        } else if (switchError.code === 4001) {
          throw new Error('Connection rejected. Please approve the network switch in MetaMask.');
        } else {
          throw switchError;
        }
      }

      // Create provider and get signer using the selected ethereum provider
      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      
      console.log('🎉 Successfully connected to Polygon via MetaMask!');

      return {
        address: this.address,
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error: any) {
      console.error('❌ Polygon connection failed:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('User rejected')) {
        throw new Error('Connection rejected. Please approve the connection in MetaMask.');
      } else if (error.message.includes('Already processing')) {
        throw new Error('MetaMask is busy. Please check MetaMask and try again.');
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
