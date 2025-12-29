// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title WCCThemeNFT
 * @dev Simple ERC721 NFT contract for WCC Theme minting on Mantle L2
 * 
 * Deployment instructions:
 * 1. Go to https://remix.ethereum.org
 * 2. Create new file: WCCThemeNFT.sol
 * 3. Paste this code
 * 4. Compile with Solidity 0.8.20
 * 5. Deploy to Mantle:
 *    - Mainnet: https://rpc.mantle.xyz (chainId: 5000)
 *    - Testnet: https://rpc.sepolia.mantle.xyz (chainId: 5003)
 * 6. Save deployed contract address to Supabase secrets as MANTLE_NFT_CONTRACT
 */
contract WCCThemeNFT is ERC721URIStorage {
    using Strings for uint256;

    uint256 private _nextTokenId;
    
    // Mint fee: 0.01 MNT (adjustable)
    uint256 public mintFee = 0.01 ether;
    
    // Treasury wallet for collecting fees
    address public treasury;
    
    // Events
    event ThemeMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string metadataUri
    );

    constructor(address _treasury) ERC721("WCC Theme", "WCCT") {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @dev Mint a new theme NFT
     * @param to Recipient address
     * @param uri IPFS metadata URI
     */
    function mint(address to, string memory uri) public payable returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Transfer fee to treasury
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }
        
        emit ThemeMinted(tokenId, to, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Free mint (for testing on testnet)
     */
    function freeMint(address to, string memory uri) public returns (uint256) {
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit ThemeMinted(tokenId, to, uri);
        
        return tokenId;
    }

    /**
     * @dev Get total supply of minted NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Update mint fee (only treasury can do this)
     */
    function setMintFee(uint256 _newFee) external {
        require(msg.sender == treasury, "Only treasury");
        mintFee = _newFee;
    }
    
    /**
     * @dev Update treasury address
     */
    function setTreasury(address _newTreasury) external {
        require(msg.sender == treasury, "Only treasury");
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
    }
}
