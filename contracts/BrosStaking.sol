// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BrosStaking
 * @dev Staking contract for BROS tokens with flexible reward distribution
 */
contract BrosStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public brosToken;
    
    // Staking info
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 lockPeriod; // in seconds
    }
    
    // User stakes
    mapping(address => StakeInfo[]) public userStakes;
    
    // Lock period options (in days)
    uint256 public constant NO_LOCK = 0;
    uint256 public constant LOCK_30_DAYS = 30 days;
    uint256 public constant LOCK_90_DAYS = 90 days;
    uint256 public constant LOCK_180_DAYS = 180 days;
    uint256 public constant LOCK_365_DAYS = 365 days;
    
    // APY rates (basis points: 100 = 1%)
    mapping(uint256 => uint256) public apyRates;
    
    // Total staked
    uint256 public totalStaked;
    
    // Minimum stake amount
    uint256 public minStakeAmount;
    
    // Emergency withdrawal penalty (basis points)
    uint256 public earlyWithdrawalPenalty = 1000; // 10%
    
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 stakeIndex);
    event Unstaked(address indexed user, uint256 amount, uint256 stakeIndex);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 stakeIndex);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 penalty, uint256 stakeIndex);
    event APYRateUpdated(uint256 lockPeriod, uint256 newRate);
    
    constructor(address _brosToken, uint256 _minStakeAmount) Ownable(msg.sender) {
        require(_brosToken != address(0), "Invalid token address");
        brosToken = IERC20(_brosToken);
        minStakeAmount = _minStakeAmount;
        
        // Set default APY rates
        apyRates[NO_LOCK] = 500;           // 5% APY
        apyRates[LOCK_30_DAYS] = 1000;     // 10% APY
        apyRates[LOCK_90_DAYS] = 1500;     // 15% APY
        apyRates[LOCK_180_DAYS] = 2000;    // 20% APY
        apyRates[LOCK_365_DAYS] = 3000;    // 30% APY
    }
    
    /**
     * @dev Stake BROS tokens
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount >= minStakeAmount, "Amount below minimum");
        require(
            lockPeriod == NO_LOCK ||
            lockPeriod == LOCK_30_DAYS ||
            lockPeriod == LOCK_90_DAYS ||
            lockPeriod == LOCK_180_DAYS ||
            lockPeriod == LOCK_365_DAYS,
            "Invalid lock period"
        );
        
        brosToken.safeTransferFrom(msg.sender, address(this), amount);
        
        StakeInfo memory newStake = StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            lockPeriod: lockPeriod
        });
        
        userStakes[msg.sender].push(newStake);
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, lockPeriod, userStakes[msg.sender].length - 1);
    }
    
    /**
     * @dev Calculate pending rewards for a stake
     */
    function calculateRewards(address user, uint256 stakeIndex) public view returns (uint256) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        
        StakeInfo memory stakeInfo = userStakes[user][stakeIndex];
        uint256 timeStaked = block.timestamp - stakeInfo.lastClaimTime;
        uint256 apy = apyRates[stakeInfo.lockPeriod];
        
        // Calculate rewards: (amount * APY * timeStaked) / (365 days * 10000)
        uint256 rewards = (stakeInfo.amount * apy * timeStaked) / (365 days * 10000);
        
        return rewards;
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");
        
        userStakes[msg.sender][stakeIndex].lastClaimTime = block.timestamp;
        
        brosToken.safeTransfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards, stakeIndex);
    }
    
    /**
     * @dev Unstake tokens after lock period
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakeInfo memory stakeInfo = userStakes[msg.sender][stakeIndex];
        require(
            block.timestamp >= stakeInfo.startTime + stakeInfo.lockPeriod,
            "Lock period not ended"
        );
        
        // Claim pending rewards first
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        
        uint256 totalAmount = stakeInfo.amount + rewards;
        totalStaked -= stakeInfo.amount;
        
        // Remove stake
        _removeStake(msg.sender, stakeIndex);
        
        brosToken.safeTransfer(msg.sender, totalAmount);
        
        emit Unstaked(msg.sender, totalAmount, stakeIndex);
    }
    
    /**
     * @dev Emergency withdraw with penalty
     */
    function emergencyWithdraw(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakeInfo memory stakeInfo = userStakes[msg.sender][stakeIndex];
        
        uint256 penalty = (stakeInfo.amount * earlyWithdrawalPenalty) / 10000;
        uint256 amountAfterPenalty = stakeInfo.amount - penalty;
        
        totalStaked -= stakeInfo.amount;
        
        // Remove stake
        _removeStake(msg.sender, stakeIndex);
        
        brosToken.safeTransfer(msg.sender, amountAfterPenalty);
        brosToken.safeTransfer(owner(), penalty);
        
        emit EmergencyWithdraw(msg.sender, amountAfterPenalty, penalty, stakeIndex);
    }
    
    /**
     * @dev Get user's all stakes
     */
    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Update APY rate for a lock period (owner only)
     */
    function setAPYRate(uint256 lockPeriod, uint256 newRate) external onlyOwner {
        require(newRate <= 10000, "Rate too high"); // Max 100% APY
        apyRates[lockPeriod] = newRate;
        emit APYRateUpdated(lockPeriod, newRate);
    }
    
    /**
     * @dev Update early withdrawal penalty (owner only)
     */
    function setEarlyWithdrawalPenalty(uint256 newPenalty) external onlyOwner {
        require(newPenalty <= 2000, "Penalty too high"); // Max 20%
        earlyWithdrawalPenalty = newPenalty;
    }
    
    /**
     * @dev Update minimum stake amount (owner only)
     */
    function setMinStakeAmount(uint256 newAmount) external onlyOwner {
        minStakeAmount = newAmount;
    }
    
    /**
     * @dev Internal function to remove stake from array
     */
    function _removeStake(address user, uint256 stakeIndex) private {
        uint256 lastIndex = userStakes[user].length - 1;
        if (stakeIndex != lastIndex) {
            userStakes[user][stakeIndex] = userStakes[user][lastIndex];
        }
        userStakes[user].pop();
    }
}
