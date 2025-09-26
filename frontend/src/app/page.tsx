"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface Message {
  sender: 'user' | 'agent';
  text: string;
  isTransaction?: boolean;
  transactionData?: any;
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

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
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
  const executeSwap = async (transactionData: any) => {
    if (!wallet.signer) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Parse the 1inch transaction data properly
      let txParams: any = {};
      
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
        text: `Transaction confirmed! Hash: ${receipt.hash}\nBlock: ${receipt.blockNumber}`,
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
      const response = await fetch('http://localhost:8000/ask-agent', {
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

      const data = await response.json();
      
      const agentMessage: Message = {
        sender: 'agent',
        text: data.response,
        isTransaction: data.is_transaction,
        transactionData: data.transaction_data
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'agent',
        text: "Sorry, I couldn't connect to the backend. Please make sure the server is running.",
        isTransaction: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInputText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              RWA-GPT
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered Real-World Asset conversational agent
            </p>
          </div>
          <div>
            {wallet.address ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p className="text-lg mb-2">Welcome to RWA-GPT!</p>
              <p className="text-sm">Ask me about RWA investments, show me the latest data, or request a swap.</p>
              <div className="mt-4 text-xs space-y-1">
                <p>Try: "show investments"</p>
                <p>Try: "invest 100 USDC in TCB-001"</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.isTransaction && message.transactionData && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => executeSwap(message.transactionData)}
                        className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Execute Swap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about RWA investments..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}