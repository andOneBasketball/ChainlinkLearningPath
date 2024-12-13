require("hardhat-deploy");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:1080");
setGlobalDispatcher(proxyAgent);

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const LOCAL_PRIVATE_KEY = process.env.LOCAL_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.4.24",
      }
    ]
  },
  networks: {
    localhost: {
      chainId: 31337,
      accounts: [LOCAL_PRIVATE_KEY],
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
        sepolia: ETHERSCAN_API_KEY,
    }
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  },

  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
        default: 1,
    },
  },
  gasReporter: {
    enabled: false
  },
  mocha: {
    timeout: 500000, // 500 seconds max for running tests
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts"
  },
};
