// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Charity {
    struct Campaign {
        address payable charity;
        uint256 totalDonations;
        uint256 donorCount;
        uint256 highestDonation;
    }
    struct Auction {
        address payable charity;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool ended;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Auction)   public auctions;
    uint256 public campaignCount;
    uint256 public auctionCount;

    event Donated(uint256 campaignId, address donor, uint256 amount);
    event AuctionCreated(uint256 auctionId, uint256 startTime, uint256 endTime);
    event Bid(uint256 auctionId, address bidder, uint256 amount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 amount);

    // 1) Create a campaign for a charity
    function createCampaign(address payable _charity) external {
        campaigns[++campaignCount] = Campaign(_charity, 0, 0, 0);
    }

    // 2) Donate
    function donate(uint256 _campaignId) external payable {
        require(msg.value > 0, "Must send ETH");
        Campaign storage c = campaigns[_campaignId];
        c.totalDonations += msg.value;
        c.donorCount++;
        if (msg.value > c.highestDonation) {
            c.highestDonation = msg.value;
        }
        c.charity.transfer(msg.value);
        emit Donated(_campaignId, msg.sender, msg.value);
    }

    // 3) Create a timed auction
    function createAuction(address payable _charity, uint256 durationSeconds) external {
        uint256 start = block.timestamp;
        uint256 end   = start + durationSeconds;
        auctions[++auctionCount] = Auction(_charity, start, end, address(0), 0, false);
        emit AuctionCreated(auctionCount, start, end);
    }

    // 4) Place a bid
    function bid(uint256 _auctionId) external payable {
        Auction storage a = auctions[_auctionId];
        require(block.timestamp >= a.startTime, "Not started");
        require(block.timestamp < a.endTime, "Already ended");
        require(msg.value > a.highestBid, "Bid too low");

        // refund previous highest
        if (a.highestBid > 0) {
            payable(a.highestBidder).transfer(a.highestBid);
        }

        a.highestBidder = msg.sender;
        a.highestBid    = msg.value;
        emit Bid(_auctionId, msg.sender, msg.value);
    }

    // 5) End auction and transfer funds
    function endAuction(uint256 _auctionId) external {
        Auction storage a = auctions[_auctionId];
        require(block.timestamp >= a.endTime, "Not yet ended");
        require(!a.ended, "Already ended");
        a.ended = true;
        if (a.highestBid > 0) {
            a.charity.transfer(a.highestBid);
        }
        emit AuctionEnded(_auctionId, a.highestBidder, a.highestBid);
    }

    // 6) Getter for metrics (average donation)
    function getCampaignMetrics(uint256 _campaignId) 
        external view returns (
            uint256 total, 
            uint256 count, 
            uint256 highest, 
            uint256 average
        ) 
    {
        Campaign storage c = campaigns[_campaignId];
        total   = c.totalDonations;
        count   = c.donorCount;
        highest = c.highestDonation;
        average = count > 0 ? total / count : 0;
    }
}
