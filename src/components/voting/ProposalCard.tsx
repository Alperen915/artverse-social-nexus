
import { useState } from 'react';
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
  const { user } = useAuth();

  const handleVote = async (voteChoice: boolean) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    setVoting(true);
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          proposal_id: proposal.id,
          voter_id: user.id,
          vote_choice: voteChoice,
          voting_power: 1,
        });

      if (error) {
        console.error('Error voting:', error);
        if (error.code === '23505') {
          alert('You have already voted on this proposal');
        } else {
          alert('Failed to submit vote');
        }
      } else {
        alert('Vote submitted successfully!');
        onVoteUpdate();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit vote');
    } finally {
      setVoting(false);
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
                disabled={voting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Vote Yes
              </Button>
              <Button
                onClick={() => handleVote(false)}
                disabled={voting}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Vote No
              </Button>
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
