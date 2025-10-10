import { ethers } from 'ethers';

// Push Chain Configuration (NOW LIVE!)
export const PUSH_CHAIN_CONFIG = {
  chainId: 1001,
  chainName: 'Push Chain Testnet',
  rpcUrl: 'https://rpc.push.org',
  blockExplorerUrl: 'https://donut.push.network',
  nativeCurrency: {
    name: 'PC',
    symbol: 'PC',
    decimals: 18,
  },
  // Gas abstraction settings
  gasless: true,
  metaTransactions: true,
};

// Push Chain Network Details for Wallet Connection
export const PUSH_CHAIN_NETWORK = {
  chainId: `0x${PUSH_CHAIN_CONFIG.chainId.toString(16)}`, // 0x3e9
  chainName: PUSH_CHAIN_CONFIG.chainName,
  nativeCurrency: PUSH_CHAIN_CONFIG.nativeCurrency,
  rpcUrls: [PUSH_CHAIN_CONFIG.rpcUrl],
  blockExplorerUrls: [PUSH_CHAIN_CONFIG.blockExplorerUrl],
};

// Push Chain Provider Class
export class PushChainProvider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private address: string | null = null;

  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }

  // Initialize Push Chain connection
  async connect(): Promise<{
    address: string;
    provider: ethers.BrowserProvider;
    signer: ethers.JsonRpcSigner;
  }> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }

    try {
      // First, try to switch to Push Chain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: PUSH_CHAIN_NETWORK.chainId }],
        });
      } catch (switchError: any) {
        // If switch fails, try to add the network
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [PUSH_CHAIN_NETWORK],
            });
          } catch (addError) {
            throw new Error('Failed to add Push Chain network');
          }
        } else {
          throw switchError;
        }
      }

      // Create provider and get signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];

      return {
        address: this.address,
        provider: this.provider,
        signer: this.signer,
      };
    } catch (error) {
      console.error('Push Chain connection failed:', error);
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

  // Check if connected to Push Chain
  async isConnectedToPushChain(): Promise<boolean> {
    try {
      const network = await this.getNetwork();
      return Number(network.chainId) === PUSH_CHAIN_CONFIG.chainId;
    } catch {
      return false;
    }
  }

  // Execute transaction with gas abstraction
  async executeTransaction(transaction: {
    to: string;
    value?: string;
    data?: string;
    gasLimit?: string;
  }) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    // Check if we're on Push Chain
    const isOnPushChain = await this.isConnectedToPushChain();
    if (!isOnPushChain) {
      throw new Error('Please switch to Push Chain network');
    }

    try {
      // For Push Chain, we can use gas abstraction
      // The transaction will be sponsored or use meta-transactions
      const txResponse = await this.signer.sendTransaction({
        to: transaction.to,
        value: transaction.value || '0x0',
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit || '0x5208',
        // Gas price can be set to 0 for gasless transactions
        gasPrice: PUSH_CHAIN_CONFIG.gasless ? '0x0' : undefined,
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
export const pushChainProvider = new PushChainProvider();

// Utility functions
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  if (num < 0.001) return '< 0.001 PUSH';
  return `${num.toFixed(4)} PUSH`;
};

// Push Chain specific error messages
export const PUSH_CHAIN_ERRORS = {
  NETWORK_NOT_FOUND: 'Push Chain network not found. Please add it to your wallet.',
  USER_REJECTED: 'Transaction rejected by user',
  INSUFFICIENT_FUNDS: 'Insufficient funds for gas fees',
  WRONG_NETWORK: 'Please switch to Push Chain network',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
};
