const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Charity", function () {
  let Charity, charity, owner, donor, charityAddr;

  beforeEach(async function () {
    [owner, donor, charityAddr] = await ethers.getSigners();
    Charity = await ethers.getContractFactory("Charity");
    charity = await Charity.deploy();
    await charity.createCampaign(charityAddr.address);
  });

  it("should accept donations and update metrics", async function () {
    await expect(
      charity.connect(donor).donate(1, { value: ethers.utils.parseEther("1") })
    ).to.emit(charity, "Donated");
    const [total, count, highest, avg] = await charity.getCampaignMetrics(1);
    expect(total).to.equal(ethers.utils.parseEther("1"));
    expect(count).to.equal(1);
    expect(highest).to.equal(ethers.utils.parseEther("1"));
    expect(avg).to.equal(ethers.utils.parseEther("1"));
  });

  it("should handle auction bids", async function () {
    await charity.createAuction(charityAddr.address, 60); // 1-minute
    await charity.bid(1, { value: ethers.utils.parseEther("2") });
    await charity.bid(1, { value: ethers.utils.parseEther("3") });
    // simulate time pass
    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine");
    await expect(charity.endAuction(1)).to.emit(charity, "AuctionEnded");
  });
});
