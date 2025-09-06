// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FlowMintNFT.sol";
import "./IERC20.sol";

contract RevenueDistributor {
    address public immutable creator;
    FlowMintNFT public immutable nftContract;
    IERC20 public immutable usdcToken;

    uint256 public immutable mintPrice;
    uint256 public immutable maxSupply;

    uint256 public totalSupply;
    uint256 public totalRevenueDeposited;
    mapping(uint256 => uint256) public revenueClaimedPerToken;

    event Minted(address indexed minter, uint256 indexed tokenId);
    event RevenueDeposited(uint256 amount);
    event RevenueClaimed(uint256 indexed tokenId, uint256 amount);

    constructor(
        address _creator,
        uint256 _mintPrice,
        uint256 _maxSupply,
        address _usdcTokenAddress
    ) {
        creator = _creator;
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
        usdcToken = IERC20(_usdcTokenAddress);

        nftContract = new FlowMintNFT();
        nftContract.transferOwnership(address(this));
    }

    /// @notice Mint an NFT representing a share of future revenue
    function mint(string memory tokenURI) public {
        require(totalSupply < maxSupply, "Sold out");

        // Uncomment when you actually want USDC to be paid for minting
        // bool success = usdcToken.transferFrom(msg.sender, creator, mintPrice);
        // require(success, "USDC transfer failed");

        totalSupply++;
        uint256 tokenId = nftContract.safeMint(msg.sender, tokenURI);
        emit Minted(msg.sender, tokenId);
    }

    /// @notice Creator deposits USDC into the revenue pool
    /// Caller must first approve this contract for `amount`
    function depositRevenue(uint256 amount) external {
    require(msg.sender == creator, "Only creator can deposit");
    require(amount > 0, "Amount must be > 0");
    bool ok = usdcToken.transferFrom(msg.sender, address(this), amount);
    require(ok, "USDC transfer failed");
    totalRevenueDeposited += amount;
    emit RevenueDeposited(amount);
}

    /// @notice Returns how much USDC a given token can currently claim
    function getClaimableRevenue(uint256 tokenId) public view returns (uint256) {
        require(nftContract.ownerOf(tokenId) != address(0), "Token does not exist");
        if (maxSupply == 0) return 0;

        uint256 totalShare = totalRevenueDeposited / maxSupply;
        return totalShare - revenueClaimedPerToken[tokenId];
    }

    /// @notice Owner of an NFT can claim their share
    function claimRevenue(uint256 tokenId) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");

        uint256 claimable = getClaimableRevenue(tokenId);
        require(claimable > 0, "No revenue to claim");

        revenueClaimedPerToken[tokenId] += claimable;
        bool ok = usdcToken.transfer(msg.sender, claimable);
        require(ok, "USDC transfer failed");

        emit RevenueClaimed(tokenId, claimable);
    }
}
