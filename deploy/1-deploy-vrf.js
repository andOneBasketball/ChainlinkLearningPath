const hre = require("hardhat");
const { ethers } = require("ethers");
const { network } = hre;
const { networkConfig, developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { expect } = require("chai");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS;

    console.log(`----------------------------------------------------deployer: ${deployer}`);
    const chainId = network.config.chainId;
    const vrfCoordinator = networkConfig[chainId]["vrfCoordinator"];
    let subscriptionId = networkConfig[chainId]["subscriptionId"];
    const vrfCoordinatorV2 = await hre.ethers.getContractAt("VRFCoordinatorV2", vrfCoordinator);
    if (subscriptionId === undefined || subscriptionId === "") {
        console.log("create subscriptionId");
        /*
        let txResponse = await vrfCoordinatorV2.createSubscription();
        let receipt = await txResponse.wait(6);
        console.log(`receipt1 data: ${JSON.stringify(receipt)}`);
        */
        let lastBlock = await hre.ethers.provider.getBlock("latest");
        const subCreationEventName = vrfCoordinatorV2.filters.SubscriptionCreated;
        let events = await vrfCoordinatorV2.queryFilter(subCreationEventName, lastBlock.number - 1000, lastBlock.number);
        for (const eventData of events) {
            subscriptionId = ethers.toBigInt(eventData.topics[1]).toString();
            console.log(`Subscription created with ID: ${subscriptionId}`);
        }
        subscriptionId = "12211";

        // fund subscription
        const fundAmount = "20000000000000000000";
        console.log(`${networkConfig[chainId]["linkTokenAddress"]}`);
        const LINKToken = await hre.ethers.getContractAt("@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol:LinkTokenInterface", networkConfig[chainId]["linkTokenAddress"]);
        txResponse = await LINKToken.transferAndCall(
            vrfCoordinatorV2.target, 
            fundAmount, 
            ethers.AbiCoder.defaultAbiCoder().encode(["uint64"], [subscriptionId])
        );
        receipt = await txResponse.wait(6);
        console.log(`receipt2 data: ${JSON.stringify(receipt)}`);
        
        lastBlock = await hre.ethers.provider.getBlock("latest");
        const subscriptionFundEventName = vrfCoordinatorV2.filters.SubscriptionFunded;
        events = await vrfCoordinatorV2.queryFilter(subscriptionFundEventName, lastBlock.number - 1000, lastBlock.number);
        /*
        event data:
        [{"_type":"log","address":"0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625","blockHash":"0x168902eda79a28a52d3e54ee11e4ed194b75e89ca8946ee26da9c9993dc65906","blockNumber":7263270,"data":"0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001158e460913d00000","index":119,"removed":false,"topics":["0xd39ec07f4e209f627a4c427971473820dc129761ba28de8906bd56f57101d4f8","0x0000000000000000000000000000000000000000000000000000000000002fb3"],"transactionHash":"0xac69e12a817d579f72603381c3829b07ea50989a4396843122ab5df6fc20b22b","transactionIndex":97},{"_type":"log","address":"0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625","blockHash":"0xe1c5635a7b9642734e95eff0aedb1fa5026137136107c8ec0b795c33612952cc","blockNumber":7263279,"data":"0x000000000000000000000000000000000000000000000001158e460913d000000000000000000000000000000000000000000000000000022b1c8c1227a00000","index":297,"removed":false,"topics":["0xd39ec07f4e209f627a4c427971473820dc129761ba28de8906bd56f57101d4f8","0x0000000000000000000000000000000000000000000000000000000000002fb3"],"transactionHash":"0x59943a9aa159ae2af960e3debc79fb501ca369866dd98c1b4cb0874552454fac","transactionIndex":158},{"_type":"log","address":"0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625","blockHash":"0xa584bdccc17ac0741f5d5ae6611f7ddbc34e34b422d698e36ac3d758ef1e8b5a","blockNumber":7263326,"data":"0x0000000000000000000000000000000000000000000000022b1c8c1227a0000000000000000000000000000000000000000000000000000340aad21b3b700000","index":310,"removed":false,"topics":["0xd39ec07f4e209f627a4c427971473820dc129761ba28de8906bd56f57101d4f8","0x0000000000000000000000000000000000000000000000000000000000002fb3"],"transactionHash":"0x6acdf5cdaa728c92bbfc2ebf3c7b5bc0c4955099ba74694dc51b3e578807fa23","transactionIndex":171}]
        */
        //console.log(`${JSON.stringify(events)}`);
        console.log(`subId: ${events[0].topics[1]}`);
    }

    const keyHash = networkConfig[chainId]["keyHash"];
    console.log(`chainId: ${chainId}, subscriptionId: ${subscriptionId}, vrfCoordinator: ${vrfCoordinator}, keyHash: ${keyHash}`);
    const arguments = [subscriptionId, vrfCoordinator, keyHash];
    const vrfTask = await deploy("VRFTask", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });
    console.log("VRFTask address " + vrfTask.address);

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying...");
        await verify(vrfTask.address, arguments);
    }
    let tx = await vrfCoordinatorV2.addConsumer(subscriptionId, vrfTask.address);
    await tx.wait();
    console.log("Added consumer to subscription");
};


module.exports.tags = ["all", "vrf"];