
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
}

export const CreateProposalModal = ({ isOpen, onClose, communityId }: CreateProposalModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposalType: 'general',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const votingEnd = new Date();
      votingEnd.setDate(votingEnd.getDate() + 7); // 7 days voting period

      const { error } = await supabase
        .from('proposals')
        .insert({
          title: formData.title,
          description: formData.description,
          proposal_type: formData.proposalType,
          community_id: communityId,
          creator_id: user.id,
          voting_end: votingEnd.toISOString(),
        });

      if (error) {
        console.error('Error creating proposal:', error);
        alert('Failed to create proposal');
      } else {
        onClose();
        setFormData({ title: '', description: '', proposalType: 'general' });
        alert('Proposal created successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Proposal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <Textarea
            placeholder="Proposal Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
          
          <select
            value={formData.proposalType}
            onChange={(e) => setFormData({ ...formData, proposalType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="general">General</option>
            <option value="treasury">Treasury</option>
            <option value="governance">Governance</option>
            <option value="membership">Membership</option>
            <option value="gallery">NFT Gallery</option>
          </select>
          
          {formData.proposalType === 'gallery' && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <p><strong>Note:</strong> Use the "Propose Gallery" button in the Gallery tab for better gallery creation experience.</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Proposal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
