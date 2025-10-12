require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    // Bros Chain Testnet
    brosTestnet: {
      url: process.env.BROS_TESTNET_RPC_URL || "https://testnet-rpc.bros-chain.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 888888, // Bros Chain Testnet Chain ID
      gasPrice: 1000000000 // 1 gwei
    },
    // Bros Chain Mainnet
    brosMainnet: {
      url: process.env.BROS_MAINNET_RPC_URL || "https://rpc.bros-chain.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 999999, // Bros Chain Mainnet Chain ID
      gasPrice: 2000000000 // 2 gwei
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
