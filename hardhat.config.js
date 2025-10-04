require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Push Chain Testnet Configuration
    pushchain: {
      url: "https://testnet-rpc.pushchain.io", // Push Chain testnet RPC
      chainId: 1001, // Push Chain testnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
    // Keep existing Polygon Amoy for reference
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology/",
      chainId: 80002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Local development
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      pushchain: process.env.PUSHCHAIN_API_KEY || "",
    },
    customChains: [
      {
        network: "pushchain",
        chainId: 1001,
        urls: {
          apiURL: "https://testnet-explorer.pushchain.io/api",
          browserURL: "https://testnet-explorer.pushchain.io",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
