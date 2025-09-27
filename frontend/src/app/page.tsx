"use client";

import { useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      send: (method: string, params?: unknown[]) => Promise<unknown>;
    };
  }
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  isTransaction?: boolean;
  transactionData?: Record<string, unknown>;
}

interface WalletState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setWallet({
          address: accounts[0],
          provider,
          signer
        });
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet");
    }
  };

  // Execute swap transaction
  const executeSwap = async (transactionData: Record<string, unknown>) => {
    if (!wallet.signer) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Parse the 1inch transaction data properly
      let txParams: Record<string, unknown> = {};
      
      if (transactionData.tx) {
        // 1inch v5 format
        txParams = {
          to: transactionData.tx.to,
          value: transactionData.tx.value || "0x0",
          data: transactionData.tx.data,
          gasLimit: transactionData.tx.gas || "0x5208", // Default gas limit
        };
      } else if (transactionData.to) {
        // Direct format
        txParams = {
          to: transactionData.to,
          value: transactionData.value || "0x0",
          data: transactionData.data,
          gasLimit: transactionData.gas || "0x5208",
        };
      } else {
        throw new Error("Invalid transaction data format");
      }

      // Add gas price if available
      if (transactionData.gasPrice) {
        txParams.gasPrice = transactionData.gasPrice;
      }

      console.log("Sending transaction with params:", txParams);

      const tx = await wallet.signer.sendTransaction(txParams);

      const successMessage: Message = {
        sender: 'agent',
        text: `Transaction submitted! Hash: ${tx.hash}\nWaiting for confirmation...`,
        isTransaction: false
      };
      
      setMessages(prev => [...prev, successMessage]);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      const confirmedMessage: Message = {
        sender: 'agent',
        text: `Transaction confirmed! Hash: ${receipt?.hash}\nBlock: ${receipt?.blockNumber}`,
        isTransaction: false
      };
      
      setMessages(prev => [...prev, confirmedMessage]);
    } catch (error: any) {
      console.error("Transaction failed:", error);
      let errorMsg = "Transaction failed";
      
      if (error.code === -32603) {
        errorMsg = "Transaction rejected by network. Please check your wallet and try again.";
      } else if (error.code === 4001) {
        errorMsg = "Transaction rejected by user";
      } else if (error.message) {
        errorMsg = `Transaction failed: ${error.message}`;
      }
      
      const errorMessage: Message = {
        sender: 'agent',
        text: errorMsg,
        isTransaction: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: inputText
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call backend API
      const response = await fetch(`${API_BASE}/ask-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          chainId: wallet.provider ? Number((await wallet.provider.getNetwork()).chainId) : 137,
          fromAddress: wallet.address,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = await response.json();
      
      const agentMessage: Message = {
        sender: 'agent',
        text: data.response,
        isTransaction: data.is_transaction,
        transactionData: data.transaction_data
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch {
      const errorMessage: Message = {
        sender: 'agent',
        text: "Sorry, I couldn't connect to the backend. Please make sure the server is running.",
        isTransaction: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInputText("");
  };

  const quickActions = [
    { title: "Show Investments", query: "show investments", icon: "📊" },
    { title: "Investment Options", query: "show me investment options", icon: "💼" },
    { title: "Invest 100 USDC", query: "invest 100 USDC in TCB-001", icon: "💰" },
    { title: "Portfolio Status", query: "show my portfolio", icon: "📈" }
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
              R
            </div>
            {sidebarOpen && <span className="font-semibold">RWA-GPT</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-orange-500 text-white"
              onClick={() => setMessages([])}
            >
              <span>💬</span>
              {sidebarOpen && <span>AI Chat Helper</span>}
            </button>
            
            {sidebarOpen && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-1">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputText(action.query);
                        const event = { preventDefault: () => {} } as React.FormEvent;
                        handleSubmit(event);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      <span>{action.icon}</span>
                      <span>{action.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Wallet Status */}
        <div className="p-4 border-t border-gray-700">
          {wallet.address ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {sidebarOpen && (
                <span className="text-xs text-gray-400">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`${sidebarOpen ? 'w-full' : 'w-8 h-8'} bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium ${sidebarOpen ? 'py-2' : 'flex items-center justify-center'}`}
            >
              {isConnecting ? "..." : sidebarOpen ? "Connect Wallet" : "🔗"}
            </button>
          )}
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 -right-3 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-xs"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Chat Helper</h1>
              <p className="text-sm text-gray-500">Real-World Asset conversational agent</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {messages.length}/50
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  R
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to RWA-GPT</h2>
                <p className="text-gray-600 mb-8">Your AI-powered Real-World Asset conversational agent. Ask me about investments, show data, or request swaps.</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputText(action.query);
                        const event = { preventDefault: () => {} } as React.FormEvent;
                        handleSubmit(event);
                      }}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{action.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-6 py-4 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.text}</pre>
                        {message.isTransaction && message.transactionData && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => executeSwap(message.transactionData)}
                              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <span>⚡</span>
                              Execute Swap
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-end ${message.sender === 'user' ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        message.sender === 'user' 
                          ? 'bg-gray-300 text-gray-700' 
                          : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                      }`}>
                        {message.sender === 'user' ? 'U' : 'R'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about RWA investments..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}