const hre = require("hardhat");
const { network } = hre;
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    const vrfTaskContractAddress = "0x73FD49F0b7b3B89f09a6d1839E4876ee54F3Fe95";
    const chainId = network.config.chainId;
    const vrfTaskContract = await hre.ethers.getContractAt("VRFTask", vrfTaskContractAddress);
    console.log(`s_requestId: ${await vrfTaskContract.s_requestId()}`);

    // Request random words from VRFCoordinator
    let tx = await vrfTaskContract.requestRandomWords();
    await tx.wait();
  
    const requestId = await vrfTaskContract.s_requestId();
    const VRFCoordinator = await hre.ethers.getContractAt("VRFCoordinatorV2", networkConfig[chainId]["vrfCoordinator"]);
    console.log(`Request ID: ${requestId}, VRFCoordinator ${VRFCoordinator.target}`);
    const rand0 = await vrfTaskContract.s_randomWords(0);
    const rand1 = await vrfTaskContract.s_randomWords(1);
    const rand2 = await vrfTaskContract.s_randomWords(2);
    const rand3 = await vrfTaskContract.s_randomWords(3);
    const rand4 = await vrfTaskContract.s_randomWords(4);
    console.log("Random words: ", rand0, rand1, rand2, rand3, rand4);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
