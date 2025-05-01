// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Decentralized Charity Platform with Auctions & Metrics
/// @notice Enables charities to register, receive donations, host timed auctions, and track transparent metrics
contract DecentralizedCharity {
    struct Charity {
        address payable owner;
        string name;
        bool registered;
        uint256 totalDonations;
        uint256 donationCount;
    }

    struct Donation {
        address donor;
        address charity;
        uint256 amount;
        uint256 timestamp;
    }

    struct Auction {
        address charity;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool finalized;
    }

    // Charity data
    mapping(address => Charity) public charities;
    
    // Donation ledger
    Donation[] public donations;
    
    // Donor metrics
    mapping(address => uint256) public donorTotalDonated;
    mapping(address => uint256) public donorDonationCount;

    // Auctions
    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCount;

    // Events
    event CharityRegistered(address indexed charityAddress, address indexed owner, string name);
    event DonationReceived(address indexed donor, address indexed charity, uint256 amount, uint256 timestamp);
    event AuctionCreated(uint256 indexed auctionId, address indexed charity, uint256 startTime, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 amount);

    /// @notice Register the calling address as a charity
    /// @param _name The human-readable name of the charity
    function registerCharity(string calldata _name) external {
        require(!charities[msg.sender].registered, "Charity already registered");
        charities[msg.sender] = Charity(payable(msg.sender), _name, true, 0, 0);
        emit CharityRegistered(msg.sender, msg.sender, _name);
    }

    /// @notice Donate Ether to a registered charity
    /// @param _charity The address of the charity to donate to
    function donate(address _charity) external payable {
        Charity storage c = charities[_charity];
        require(c.registered, "Charity not registered");
        require(msg.value > 0, "Donation must be greater than zero");

        // Record donation
        donations.push(Donation(msg.sender, _charity, msg.value, block.timestamp));
        c.totalDonations += msg.value;
        c.donationCount += 1;
        donorTotalDonated[msg.sender] += msg.value;
        donorDonationCount[msg.sender] += 1;

        // Transfer funds to charity owner
        (bool sent, ) = c.owner.call{value: msg.value}("");
        require(sent, "Transfer failed");

        emit DonationReceived(msg.sender, _charity, msg.value, block.timestamp);
    }

    /// @notice Create a timed auction for a registered charity
    /// @param _startTime Unix timestamp for auction start
    /// @param _endTime Unix timestamp for auction end
    function createAuction(uint256 _startTime, uint256 _endTime) external {
        Charity storage c = charities[msg.sender];
        require(c.registered, "Charity not registered");
        require(_startTime < _endTime, "Invalid time window");
        require(_endTime > block.timestamp, "End must be in future");

        auctions[auctionCount] = Auction(
            msg.sender,
            _startTime,
            _endTime,
            address(0),
            0,
            false
        );
        emit AuctionCreated(auctionCount, msg.sender, _startTime, _endTime);
        auctionCount++;
    }

    /// @notice Place a bid on an active auction
    /// @param _auctionId The ID of the auction
    function bid(uint256 _auctionId) external payable {
        Auction storage a = auctions[_auctionId];
        require(block.timestamp >= a.startTime && block.timestamp <= a.endTime, "Auction not active");
        require(msg.value > a.highestBid, "Bid too low");

        // Refund previous highest bidder
        if (a.highestBidder != address(0)) {
            (bool refunded, ) = a.highestBidder.call{value: a.highestBid}("");
            require(refunded, "Refund failed");
        }

        a.highestBid = msg.value;
        a.highestBidder = msg.sender;
        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    /// @notice Finalize an auction and transfer funds to the charity
    /// @param _auctionId The ID of the auction
    function finalizeAuction(uint256 _auctionId) external {
        Auction storage a = auctions[_auctionId];
        require(block.timestamp > a.endTime, "Auction not ended");
        require(!a.finalized, "Already finalized");
        
        a.finalized = true;
        if (a.highestBidder != address(0)) {
            Charity storage c = charities[a.charity];
            c.totalDonations += a.highestBid;
            c.donationCount += 1;
            donorTotalDonated[a.highestBidder] += a.highestBid;
            donorDonationCount[a.highestBidder] += 1;

            (bool sent, ) = c.owner.call{value: a.highestBid}("");
            require(sent, "Transfer failed");
        }
        emit AuctionFinalized(_auctionId, a.highestBidder, a.highestBid);
    }

    /// @notice Get total number of donations recorded
    /// @return The count of donations
    function getDonationsCount() external view returns (uint256) {
        return donations.length;
    }

    /// @notice Retrieve a donation record by index
    /// @param _index The donation index (0-based)
    /// @return donor The address of the donor
    /// @return charity The address of the charity
    /// @return amount The amount donated (in wei)
    /// @return timestamp The block timestamp when donated
    function getDonation(uint256 _index)
        external
        view
        returns (
            address donor,
            address charity,
            uint256 amount,
            uint256 timestamp
        )
    {
        require(_index < donations.length, "Index out of bounds");
        Donation storage d = donations[_index];
        return (d.donor, d.charity, d.amount, d.timestamp);
    }

    /// @notice Retrieve metrics for a given charity
    /// @param _charity Address of the charity
    /// @return totalDonated Total wei received
    /// @return donationCount Number of donations
    function getCharityMetrics(address _charity)
        external
        view
        returns (uint256 totalDonated, uint256 donationCount)
    {
        Charity storage c = charities[_charity];
        require(c.registered, "Charity not registered");
        return (c.totalDonations, c.donationCount);
    }

    /// @notice Retrieve metrics for a given donor
    /// @param _donor Address of the donor
    /// @return totalDonated Total wei donated
    /// @return donationCount Number of donations
    function getDonorMetrics(address _donor)
        external
        view
        returns (uint256 totalDonated, uint256 donationCount)
    {
        return (donorTotalDonated[_donor], donorDonationCount[_donor]);
    }
}

/*

*/
