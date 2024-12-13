const networkConfig = {
    default: {
        name: "hardhat",
    },
    31337: {
        name: "localhost",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        btcPriceFeed: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
        ethPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        linkPriceFeed: "0xc59E3633BAAC79493d908e63626716e204A45EdF",
        linkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        subscriptionId: "12211",
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        checkInterval: 120,
    },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
};
