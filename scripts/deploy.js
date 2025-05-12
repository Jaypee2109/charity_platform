async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Charity = await ethers.getContractFactory("Charity");
  const charity = await Charity.deploy();
  await charity.deployed();

  console.log("Charity deployed to:", charity.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
