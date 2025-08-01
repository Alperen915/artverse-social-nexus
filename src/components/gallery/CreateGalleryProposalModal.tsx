
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateGalleryProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
}

export const CreateGalleryProposalModal = ({ isOpen, onClose, communityId }: CreateGalleryProposalModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submissionDeadlineDays: '14',
    proposalCost: '100',
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

      // Create the proposal first
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          title: `NFT Gallery: ${formData.title}`,
          description: `Proposal to create an NFT gallery "${formData.title}". ${formData.description}\n\nSubmission deadline: ${formData.submissionDeadlineDays} days after approval.\n\nAll community members must submit one artwork. Revenue will be shared equally among all members.`,
          proposal_type: 'gallery',
          community_id: communityId,
          creator_id: user.id,
          voting_end: votingEnd.toISOString(),
        })
        .select()
        .single();

      if (proposalError) {
        console.error('Error creating proposal:', proposalError);
        alert('Failed to create gallery proposal');
        return;
      }

      // Create the gallery record linked to the proposal
      const submissionDeadline = new Date();
      submissionDeadline.setDate(submissionDeadline.getDate() + parseInt(formData.submissionDeadlineDays));

      const { error: galleryError } = await supabase
        .from('nft_galleries')
        .insert({
          title: formData.title,
          description: formData.description,
          community_id: communityId,
          proposal_id: proposal.id,
          submission_deadline: submissionDeadline.toISOString(),
          status: 'pending',
        });

      if (galleryError) {
        console.error('Error creating gallery:', galleryError);
        alert('Failed to create gallery record');
        return;
      }

      alert('Gallery proposal created successfully! Community members can now vote.');
      onClose();
      setFormData({ title: '', description: '', submissionDeadlineDays: '14', proposalCost: '100' });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create gallery proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose NFT Gallery</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Gallery Title</Label>
            <Input
              id="title"
              placeholder="Enter gallery title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the gallery theme and requirements"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="deadline">Submission Deadline (days after approval)</Label>
            <Input
              id="deadline"
              type="number"
              min="1"
              max="30"
              value={formData.submissionDeadlineDays}
              onChange={(e) => setFormData({ ...formData, submissionDeadlineDays: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="proposalCost">Proposal Cost (BROS Tokens)</Label>
            <Input
              id="proposalCost"
              type="number"
              min="1"
              value={formData.proposalCost}
              onChange={(e) => setFormData({ ...formData, proposalCost: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Bu miktar DAO hazinesine eklenecek ve galeri başarılı olursa geri ödenecek
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p><strong>Note:</strong> If this proposal passes:</p>
            <ul className="list-disc list-inside mt-1">
              <li>All community members must submit one artwork</li>
              <li>Revenue will be shared equally among all members</li>
              <li>Gallery will be published for public viewing and purchasing</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description || !formData.proposalCost}
            className="w-full"
          >
            {loading ? 'Creating Proposal...' : `Create Gallery Proposal (${formData.proposalCost} BROS)`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
