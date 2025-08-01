
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposal_type: string;
  status: string;
  yes_votes: number;
  no_votes: number;
  voting_end: string;
  created_at: string;
  creator_id: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onVoteUpdate: () => void;
}

export const ProposalCard = ({ proposal, onVoteUpdate }: ProposalCardProps) => {
  const [voting, setVoting] = useState(false);
  const [processingResult, setProcessingResult] = useState(false);
  const { user } = useAuth();

  // Check if voting has ended and process result if needed
  useEffect(() => {
    const checkAndProcessResult = async () => {
      if (proposal.status === 'active' && proposal.voting_end && new Date() >= new Date(proposal.voting_end)) {
        await processProposalResult();
      }
    };

    checkAndProcessResult();
  }, [proposal.id, proposal.status, proposal.voting_end]);

  const processProposalResult = async () => {
    if (processingResult) return;
    
    setProcessingResult(true);
    try {
      const totalVotes = proposal.yes_votes + proposal.no_votes;
      const passed = totalVotes > 0 && proposal.yes_votes > proposal.no_votes;
      const newStatus = passed ? 'passed' : 'rejected';

      // Update proposal status
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposal.id);

      if (proposalError) {
        console.error('Error updating proposal status:', proposalError);
        return;
      }

      // If it's a gallery proposal and it passed, activate the gallery
      if (proposal.proposal_type === 'gallery' && passed) {
        const { error: galleryError } = await supabase
          .from('nft_galleries')
          .update({ status: 'active' })
          .eq('proposal_id', proposal.id);

        if (galleryError) {
          console.error('Error activating gallery:', galleryError);
        }
      } else if (proposal.proposal_type === 'gallery' && !passed) {
        // If gallery proposal was rejected, cancel the gallery
        const { error: galleryError } = await supabase
          .from('nft_galleries')
          .update({ status: 'cancelled' })
          .eq('proposal_id', proposal.id);

        if (galleryError) {
          console.error('Error cancelling gallery:', galleryError);
        }
      }

      onVoteUpdate();
    } catch (error) {
      console.error('Error processing proposal result:', error);
    } finally {
      setProcessingResult(false);
    }
  };

  const handleVote = async (voteChoice: boolean) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    setVoting(true);
    try {
      // Insert the vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          proposal_id: proposal.id,
          voter_id: user.id,
          vote_choice: voteChoice,
          voting_power: 1,
        });

      if (voteError) {
        console.error('Error voting:', voteError);
        if (voteError.code === '23505') {
          alert('You have already voted on this proposal');
        } else {
          alert('Failed to submit vote');
        }
        return;
      }

      // Update the proposal vote counts
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          yes_votes: proposal.yes_votes + (voteChoice ? 1 : 0),
          no_votes: proposal.no_votes + (voteChoice ? 0 : 1),
        })
        .eq('id', proposal.id);

      if (updateError) {
        console.error('Error updating proposal counts:', updateError);
      }

      // Check for majority (simulate community size of 10 for now)
      const totalVotes = proposal.yes_votes + proposal.no_votes + 1; // +1 for current vote
      const yesVotes = proposal.yes_votes + (voteChoice ? 1 : 0);
      const noVotes = proposal.no_votes + (voteChoice ? 0 : 1);
      
      // If more than 60% votes are collected and majority is clear
      if (totalVotes >= 6) { // 60% of 10 members
        const passed = yesVotes > noVotes;
        await processImmediateResult(passed);
      }

      alert('Vote submitted successfully!');
      onVoteUpdate();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const processImmediateResult = async (passed: boolean) => {
    const newStatus = passed ? 'passed' : 'rejected';
    
    // Update proposal status
    const { error: proposalError } = await supabase
      .from('proposals')
      .update({ status: newStatus })
      .eq('id', proposal.id);

    if (proposalError) {
      console.error('Error updating proposal status:', proposalError);
      return;
    }

    // If it's a gallery proposal and it passed, activate the gallery
    if (proposal.proposal_type === 'gallery' && passed) {
      const { error: galleryError } = await supabase
        .from('nft_galleries')
        .update({ status: 'active' })
        .eq('proposal_id', proposal.id);

      if (galleryError) {
        console.error('Error activating gallery:', galleryError);
      } else {
        // Simulate NFT minting and marketplace listing
        setTimeout(() => {
          alert('🎉 Gallery approved! NFTs are being minted and will be available in the marketplace soon!');
        }, 1000);
      }
    }
  };

  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const totalVotes = proposal.yes_votes + proposal.no_votes;
  const yesPercentage = totalVotes > 0 ? (proposal.yes_votes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.no_votes / totalVotes) * 100 : 0;

  const isVotingActive = proposal.status === 'active' && new Date() < new Date(proposal.voting_end);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            <CardDescription className="mt-1">{proposal.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant="outline" className="capitalize">
              {proposal.proposal_type}
            </Badge>
            <Badge className={getStatusColor()}>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                {proposal.status}
              </div>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Special notice for gallery proposals */}
          {proposal.proposal_type === 'gallery' && (
            <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800">
              <p><strong>Gallery Proposal:</strong> If passed, all members must submit artwork and revenue will be shared equally.</p>
            </div>
          )}

          {/* Voting Results */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Yes: {proposal.yes_votes}</span>
              <span>No: {proposal.no_votes}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-l-full" 
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{yesPercentage.toFixed(1)}% Yes</span>
              <span>{noPercentage.toFixed(1)}% No</span>
            </div>
          </div>

          {/* Voting Buttons */}
          {isVotingActive && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleVote(true)}
                disabled={voting || processingResult}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Vote Yes
              </Button>
              <Button
                onClick={() => handleVote(false)}
                disabled={voting || processingResult}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Vote No
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {proposal.status === 'passed' && proposal.proposal_type === 'gallery' && (
            <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
              <p><strong>Gallery Approved!</strong> NFTs are being minted and will appear in the marketplace. Check the Gallery tab to see submissions.</p>
            </div>
          )}

          {proposal.status === 'rejected' && proposal.proposal_type === 'gallery' && (
            <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800">
              <p><strong>Gallery Rejected:</strong> This gallery proposal did not pass community vote.</p>
            </div>
          )}

          {/* Voting End Date */}
          <div className="text-xs text-gray-500 text-center">
            Voting ends: {new Date(proposal.voting_end).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
