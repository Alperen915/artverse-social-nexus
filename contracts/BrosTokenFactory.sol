// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CommunityToken
 * @dev ERC20 token for community DAOs
 */
contract CommunityToken is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals_,
        address creator
    ) ERC20(name, symbol) Ownable(creator) {
        _decimals = decimals_;
        _mint(creator, initialSupply * 10**decimals_);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

/**
 * @title BrosTokenFactory
 * @dev Factory contract for creating community DAO tokens on Brosverse platform
 */
contract BrosTokenFactory {
    // Platform fee in BROS tokens
    uint256 public creationFee;
    address public brosToken;
    address public feeCollector;
    
    // Mapping from creator to their tokens
    mapping(address => address[]) public creatorTokens;
    
    // Array of all created tokens
    address[] public allTokens;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 timestamp
    );
    
    event CreationFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);
    
    constructor(address _brosToken, address _feeCollector, uint256 _creationFee) {
        require(_brosToken != address(0), "Invalid BROS token address");
        require(_feeCollector != address(0), "Invalid fee collector");
        
        brosToken = _brosToken;
        feeCollector = _feeCollector;
        creationFee = _creationFee;
    }
    
    /**
     * @dev Create a new community token
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial supply (will be multiplied by 10^decimals)
     * @param decimals Number of decimals
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) external returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        require(decimals <= 18, "Decimals too large");
        
        // Collect creation fee in BROS tokens
        if (creationFee > 0) {
            require(
                IERC20(brosToken).transferFrom(msg.sender, feeCollector, creationFee),
                "Fee payment failed"
            );
        }
        
        // Deploy new token
        CommunityToken newToken = new CommunityToken(
            name,
            symbol,
            initialSupply,
            decimals,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        
        // Track the token
        creatorTokens[msg.sender].push(tokenAddress);
        allTokens.push(tokenAddress);
        
        emit TokenCreated(
            tokenAddress,
            msg.sender,
            name,
            symbol,
            initialSupply,
            block.timestamp
        );
        
        return tokenAddress;
    }
    
    /**
     * @dev Get tokens created by a specific address
     */
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }
    
    /**
     * @dev Get total number of tokens created
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Update creation fee (owner only)
     */
    function setCreationFee(uint256 _newFee) external {
        require(msg.sender == feeCollector, "Only fee collector");
        creationFee = _newFee;
        emit CreationFeeUpdated(_newFee);
    }
    
    /**
     * @dev Update fee collector (owner only)
     */
    function setFeeCollector(address _newCollector) external {
        require(msg.sender == feeCollector, "Only fee collector");
        require(_newCollector != address(0), "Invalid address");
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(_newCollector);
    }
}
