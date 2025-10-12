// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BrosToken
 * @dev Platform token for Brosverse ecosystem
 * Features:
 * - Fixed supply of 1 billion BROS
 * - Burnable tokens
 * - EIP-2612 permit functionality
 * - Governance integration ready
 */
contract BrosToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    // Total supply: 1 billion BROS (18 decimals)
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Allocation percentages
    uint256 public constant COMMUNITY_ALLOCATION = 400_000_000 * 10**18; // 40%
    uint256 public constant TEAM_ALLOCATION = 200_000_000 * 10**18;      // 20%
    uint256 public constant TREASURY_ALLOCATION = 200_000_000 * 10**18;  // 20%
    uint256 public constant LIQUIDITY_ALLOCATION = 100_000_000 * 10**18; // 10%
    uint256 public constant REWARDS_ALLOCATION = 100_000_000 * 10**18;   // 10%
    
    // Vesting addresses
    address public communityPool;
    address public teamVesting;
    address public treasury;
    address public liquidityPool;
    address public rewardsPool;
    
    // Anti-whale mechanism
    uint256 public maxTransferAmount;
    bool public transferLimitEnabled = true;
    mapping(address => bool) public isExcludedFromLimit;
    
    event TransferLimitUpdated(uint256 newLimit);
    event TransferLimitToggled(bool enabled);
    event AddressExcludedFromLimit(address indexed account, bool excluded);
    
    constructor(
        address _communityPool,
        address _teamVesting,
        address _treasury,
        address _liquidityPool,
        address _rewardsPool
    ) ERC20("Bros Token", "BROS") ERC20Permit("Bros Token") Ownable(msg.sender) {
        require(_communityPool != address(0), "Invalid community pool");
        require(_teamVesting != address(0), "Invalid team vesting");
        require(_treasury != address(0), "Invalid treasury");
        require(_liquidityPool != address(0), "Invalid liquidity pool");
        require(_rewardsPool != address(0), "Invalid rewards pool");
        
        communityPool = _communityPool;
        teamVesting = _teamVesting;
        treasury = _treasury;
        liquidityPool = _liquidityPool;
        rewardsPool = _rewardsPool;
        
        // Set max transfer to 1% of supply (anti-whale)
        maxTransferAmount = INITIAL_SUPPLY / 100;
        
        // Exclude key addresses from transfer limits
        isExcludedFromLimit[_communityPool] = true;
        isExcludedFromLimit[_teamVesting] = true;
        isExcludedFromLimit[_treasury] = true;
        isExcludedFromLimit[_liquidityPool] = true;
        isExcludedFromLimit[_rewardsPool] = true;
        isExcludedFromLimit[owner()] = true;
        
        // Mint initial supply to different pools
        _mint(_communityPool, COMMUNITY_ALLOCATION);
        _mint(_teamVesting, TEAM_ALLOCATION);
        _mint(_treasury, TREASURY_ALLOCATION);
        _mint(_liquidityPool, LIQUIDITY_ALLOCATION);
        _mint(_rewardsPool, REWARDS_ALLOCATION);
    }
    
    /**
     * @dev Override transfer to implement anti-whale mechanism
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        if (
            transferLimitEnabled &&
            !isExcludedFromLimit[from] &&
            !isExcludedFromLimit[to] &&
            from != address(0) &&
            to != address(0)
        ) {
            require(amount <= maxTransferAmount, "Transfer amount exceeds limit");
        }
        
        super._update(from, to, amount);
    }
    
    /**
     * @dev Update max transfer amount (owner only)
     */
    function setMaxTransferAmount(uint256 _maxTransferAmount) external onlyOwner {
        require(_maxTransferAmount > 0, "Amount must be greater than 0");
        require(_maxTransferAmount <= INITIAL_SUPPLY, "Amount exceeds total supply");
        maxTransferAmount = _maxTransferAmount;
        emit TransferLimitUpdated(_maxTransferAmount);
    }
    
    /**
     * @dev Toggle transfer limit on/off (owner only)
     */
    function toggleTransferLimit(bool _enabled) external onlyOwner {
        transferLimitEnabled = _enabled;
        emit TransferLimitToggled(_enabled);
    }
    
    /**
     * @dev Exclude or include address from transfer limit (owner only)
     */
    function setExcludedFromLimit(address account, bool excluded) external onlyOwner {
        isExcludedFromLimit[account] = excluded;
        emit AddressExcludedFromLimit(account, excluded);
    }
}
