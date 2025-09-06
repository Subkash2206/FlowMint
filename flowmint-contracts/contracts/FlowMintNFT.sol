// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// CHANGE 1: Import the correct ERC721 extension
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// CHANGE 2: Inherit from ERC721URIStorage instead of just ERC721
contract FlowMintNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("FlowMint Revenue Share NFT", "FMR") {}
    
    function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        // This line will now work correctly
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}