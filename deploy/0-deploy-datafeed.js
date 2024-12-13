const hre = require("hardhat");
const { network } = hre;
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS;

    console.log(`----------------------------------------------------deployer: ${deployer}`);
    const linkPriceFeed = "0xc59E3633BAAC79493d908e63626716e204A45EdF";
    const btcPriceFeed = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
    const ethPriceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

    // Deployed address, currently all the same for all chains https://docs.tokenbound.org/contracts/deployments
    // This are V2 contracts, check the latest ones that are used here https://docs.tokenbound.org/contracts/deployments
    const arguments = [linkPriceFeed, btcPriceFeed, ethPriceFeed];
    const datafeed = await deploy("DataFeedTask", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });
    console.log("DataFeedTask address " + datafeed.address);
    const Contract = await hre.ethers.getContractFactory("DataFeedTask");
    const contract = await Contract.attach(datafeed.address);
    
    console.log(`LinkPrice: ${await contract.getLinkLatestPrice()}, BTCPrice: ${await contract.getBtcLatestPrice()}, ETHPrice: ${await contract.getEthLatestPrice()}`);
    console.log(`value type: ${typeof(await contract.getLinkPriceFeed())}, LinkPriceFeedAddress: ${await contract.getLinkPriceFeed()}, BTCPriceFeedAddress: ${await contract.getBtcPriceFeed()}, ETHPriceFeedAddress: ${await contract.getEthPriceFeed()}`);

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying...");
        await verify(datafeed.address, arguments);
    }
};

module.exports.tags = ["all", "datafeed"];
