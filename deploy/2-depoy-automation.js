const hre = require("hardhat");
const { network } = hre;
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS;
    const arguments = [120];
    const automation = await deploy("AutomationTask", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });
    console.log(`AutomationTask deployed to: ${automation.address}`);
    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying...");
        await verify(automation.address, arguments);
    }
    const automationContract = await hre.ethers.getContractAt("AutomationTask", automation.address);
    const fighter = 3;
    let tx = await automationContract.fight(fighter);
    await tx.wait();
    console.log(`healthPoint[3] ${await automationContract.healthPoint(fighter)}`);
};

module.exports.tags = ["all", "automation"];