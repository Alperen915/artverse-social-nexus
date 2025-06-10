
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCommunityModal = ({ isOpen, onClose }: CreateCommunityModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genesisNftContract: '',
    tokenGateContract: '',
    tokenGateThreshold: 1,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('communities')
        .insert({
          name: formData.name,
          description: formData.description,
          genesis_nft_contract: formData.genesisNftContract,
          token_gate_contract: formData.tokenGateContract,
          token_gate_threshold: formData.tokenGateThreshold,
          creator_id: user.id,
        });

      if (error) {
        console.error('Error creating community:', error);
      } else {
        onClose();
        setFormData({
          name: '',
          description: '',
          genesisNftContract: '',
          tokenGateContract: '',
          tokenGateThreshold: 1,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Community Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Textarea
            placeholder="Community Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          
          <Input
            placeholder="Genesis NFT Contract Address (optional)"
            value={formData.genesisNftContract}
            onChange={(e) => setFormData({ ...formData, genesisNftContract: e.target.value })}
          />
          
          <Input
            placeholder="Token Gate Contract Address (optional)"
            value={formData.tokenGateContract}
            onChange={(e) => setFormData({ ...formData, tokenGateContract: e.target.value })}
          />
          
          <Input
            type="number"
            placeholder="Token Gate Threshold"
            value={formData.tokenGateThreshold}
            onChange={(e) => setFormData({ ...formData, tokenGateThreshold: Number(e.target.value) })}
            min={1}
          />
          
          <Button 
            type="submit" 
            disabled={loading || !formData.name}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Community'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
