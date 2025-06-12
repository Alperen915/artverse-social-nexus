
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to create a community');
      return;
    }

    if (!formData.name.trim()) {
      setError('Community name is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating community with data:', formData);
      console.log('User ID:', user.id);
      
      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        genesis_nft_contract: formData.genesisNftContract.trim() || null,
        token_gate_contract: formData.tokenGateContract.trim() || null,
        token_gate_threshold: formData.tokenGateThreshold || 1,
        creator_id: user.id,
      };

      console.log('Submitting community data:', communityData);

      const { data, error } = await supabase
        .from('communities')
        .insert(communityData)
        .select()
        .single();

      if (error) {
        console.error('Error creating community:', error);
        setError(`Failed to create community: ${error.message}`);
      } else {
        console.log('Community created successfully:', data);
        setSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          genesisNftContract: '',
          tokenGateContract: '',
          tokenGateThreshold: 1,
        });
        
        // Close modal after a brief delay to show success
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Exception creating community:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      genesisNftContract: '',
      tokenGateContract: '',
      tokenGateThreshold: 1,
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        clearForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Set up your art community with optional NFT gating
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Community created successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Community Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
          
          <Textarea
            placeholder="Community Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            disabled={loading}
          />
          
          <Input
            placeholder="Genesis NFT Contract Address (optional)"
            value={formData.genesisNftContract}
            onChange={(e) => setFormData({ ...formData, genesisNftContract: e.target.value })}
            disabled={loading}
          />
          
          <Input
            placeholder="Token Gate Contract Address (optional)"
            value={formData.tokenGateContract}
            onChange={(e) => setFormData({ ...formData, tokenGateContract: e.target.value })}
            disabled={loading}
          />
          
          <Input
            type="number"
            placeholder="Token Gate Threshold"
            value={formData.tokenGateThreshold}
            onChange={(e) => setFormData({ ...formData, tokenGateThreshold: Number(e.target.value) })}
            min={1}
            disabled={loading}
          />
          
          <Button 
            type="submit" 
            disabled={loading || !formData.name.trim() || success}
            className="w-full"
          >
            {loading ? 'Creating...' : success ? 'Created!' : 'Create Community'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
