
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateProposalModal } from './CreateProposalModal';
import { ProposalCard } from './ProposalCard';
import { Plus, Vote } from 'lucide-react';

interface VotingSectionProps {
  communityId: string;
}

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

export const VotingSection = ({ communityId }: VotingSectionProps) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
      } else {
        setProposals(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [communityId]);

  const handleCreateProposal = () => {
    if (!user) {
      alert('Please sign in to create proposals');
      return;
    }
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Vote className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Community Governance</h2>
        </div>
        <Button
          onClick={handleCreateProposal}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No proposals yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to create a proposal for community governance!
          </p>
          <Button
            onClick={handleCreateProposal}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Proposal
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVoteUpdate={fetchProposals}
            />
          ))}
        </div>
      )}

      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        communityId={communityId}
      />
    </div>
  );
};
