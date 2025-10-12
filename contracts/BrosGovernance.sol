// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BrosGovernance
 * @dev Governance contract for BROS token holders to vote on proposals
 */
contract BrosGovernance is Ownable, ReentrancyGuard {
    IERC20 public brosToken;
    
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Executed
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        ProposalState state;
        mapping(address => Receipt) receipts;
    }
    
    struct Receipt {
        bool hasVoted;
        uint8 support; // 0 = against, 1 = for, 2 = abstain
        uint256 votes;
    }
    
    // Proposal settings
    uint256 public proposalCount;
    uint256 public votingDelay = 1 days;
    uint256 public votingPeriod = 7 days;
    uint256 public proposalThreshold = 100_000 * 10**18; // 100k BROS to create proposal
    uint256 public quorumVotes = 1_000_000 * 10**18; // 1M BROS minimum for quorum
    
    mapping(uint256 => Proposal) public proposals;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    
    constructor(address _brosToken) Ownable(msg.sender) {
        require(_brosToken != address(0), "Invalid token address");
        brosToken = IERC20(_brosToken);
    }
    
    /**
     * @dev Create a new proposal
     */
    function propose(
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(
            brosToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient BROS balance to propose"
        );
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.startTime = block.timestamp + votingDelay;
        newProposal.endTime = newProposal.startTime + votingPeriod;
        newProposal.state = ProposalState.Pending;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            newProposal.startTime,
            newProposal.endTime
        );
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId The id of the proposal
     * @param support 0 = against, 1 = for, 2 = abstain
     */
    function castVote(uint256 proposalId, uint8 support) external nonReentrant {
        require(support <= 2, "Invalid vote type");
        require(state(proposalId) == ProposalState.Active, "Voting is closed");
        
        Proposal storage proposal = proposals[proposalId];
        Receipt storage receipt = proposal.receipts[msg.sender];
        
        require(!receipt.hasVoted, "Already voted");
        
        uint256 votes = brosToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        if (support == 0) {
            proposal.againstVotes += votes;
        } else if (support == 1) {
            proposal.forVotes += votes;
        } else {
            proposal.abstainVotes += votes;
        }
        
        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = votes;
        
        emit VoteCast(msg.sender, proposalId, support, votes);
    }
    
    /**
     * @dev Get the current state of a proposal
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.state == ProposalState.Canceled) {
            return ProposalState.Canceled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        // Voting has ended
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        if (totalVotes < quorumVotes) {
            return ProposalState.Defeated;
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            return ProposalState.Succeeded;
        }
        
        return ProposalState.Defeated;
    }
    
    /**
     * @dev Execute a successful proposal
     */
    function execute(uint256 proposalId) external {
        require(
            state(proposalId) == ProposalState.Succeeded,
            "Proposal not succeeded"
        );
        
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        proposal.state = ProposalState.Executed;
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (proposer or owner only)
     */
    function cancel(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(
            state(proposalId) != ProposalState.Executed,
            "Cannot cancel executed proposal"
        );
        
        proposal.state = ProposalState.Canceled;
        
        emit ProposalCanceled(proposalId);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        ProposalState currentState
    ) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            state(proposalId)
        );
    }
    
    /**
     * @dev Get voting receipt for an address
     */
    function getReceipt(uint256 proposalId, address voter) external view returns (
        bool hasVoted,
        uint8 support,
        uint256 votes
    ) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Receipt storage receipt = proposals[proposalId].receipts[voter];
        
        return (receipt.hasVoted, receipt.support, receipt.votes);
    }
    
    /**
     * @dev Update voting delay (owner only)
     */
    function setVotingDelay(uint256 newDelay) external onlyOwner {
        require(newDelay >= 1 hours && newDelay <= 7 days, "Invalid delay");
        votingDelay = newDelay;
    }
    
    /**
     * @dev Update voting period (owner only)
     */
    function setVotingPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod >= 1 days && newPeriod <= 30 days, "Invalid period");
        votingPeriod = newPeriod;
    }
    
    /**
     * @dev Update proposal threshold (owner only)
     */
    function setProposalThreshold(uint256 newThreshold) external onlyOwner {
        proposalThreshold = newThreshold;
    }
    
    /**
     * @dev Update quorum votes (owner only)
     */
    function setQuorumVotes(uint256 newQuorum) external onlyOwner {
        quorumVotes = newQuorum;
    }
}
