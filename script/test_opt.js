const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
    const data = 20
    console.log(ethers.toBigInt(data).toString());
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });