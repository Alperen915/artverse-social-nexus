
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SimulationService } from '@/lib/simulationService';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCommunityModal = ({ isOpen, onClose }: CreateCommunityModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
    genesisNftContract: '',
    tokenGateContract: '',
    tokenGateThreshold: 1,
    membershipIsFree: true,
    membershipTokenRequirement: 0,
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

    // Check if user has enough tokens for gas fee when creating DAO
    const isDao = !formData.membershipIsFree;
    const gasFee = SimulationService.GAS_FEES.DAO_CREATION;
    
    if (isDao) {
      const { data } = await supabase
        .from('user_token_balances')
        .select('balance')
        .eq('user_id', user.id)
        .eq('token_symbol', 'BROS')
        .single();
      
      if (!data || data.balance < gasFee) {
        setError(`DAO oluşturmak için yeterli BROS token yok. Gerekli: ${gasFee} BROS (gaz ücreti)`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating community with data:', formData);
      console.log('User ID:', user.id);
      
      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        cover_image: formData.logoUrl.trim() || null,
        genesis_nft_contract: formData.genesisNftContract.trim() || null,
        token_gate_contract: formData.tokenGateContract.trim() || null,
        token_gate_threshold: formData.tokenGateThreshold || 1,
        creator_id: user.id,
        membership_is_free: formData.membershipIsFree,
        membership_token_requirement: formData.membershipIsFree ? 0 : formData.membershipTokenRequirement,
        is_dao: isDao,
        dao_treasury_balance: isDao ? gasFee : 0, // Gas fee goes to DAO treasury
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
        
        // Handle DAO creation gas fee using simulation service
        if (isDao) {
          const gasProcessed = await SimulationService.simulateDAOCreation(user.id, data.id, data.name);
          if (!gasProcessed) {
            setError('DAO oluşturuldu ancak gaz ücreti işlenemedi');
            return;
          }
        }
        
        setSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          websiteUrl: '',
          logoUrl: '',
          genesisNftContract: '',
          tokenGateContract: '',
          tokenGateThreshold: 1,
          membershipIsFree: true,
          membershipTokenRequirement: 0,
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
      websiteUrl: '',
      logoUrl: '',
      genesisNftContract: '',
      tokenGateContract: '',
      tokenGateThreshold: 1,
      membershipIsFree: true,
      membershipTokenRequirement: 0,
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
            placeholder="Website URL (optional)"
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            disabled={loading}
          />

          <Input
            placeholder="Logo Image URL (optional)"
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
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

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="membership-type" className="text-sm font-medium">
                Ücretsiz Üyelik
              </Label>
              <Switch
                id="membership-type"
                checked={formData.membershipIsFree}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  membershipIsFree: checked,
                  membershipTokenRequirement: checked ? 0 : formData.membershipTokenRequirement
                })}
                disabled={loading}
              />
            </div>
            
            {!formData.membershipIsFree && (
              <div className="space-y-2">
                <Label htmlFor="token-requirement" className="text-sm font-medium">
                  Bros Chain Token Gereksinimi (DAO Hazinesine Gidecek)
                </Label>
                <Input
                  id="token-requirement"
                  type="number"
                  placeholder="Gerekli BROS token miktarı"
                  value={formData.membershipTokenRequirement}
                  onChange={(e) => setFormData({ ...formData, membershipTokenRequirement: Number(e.target.value) })}
                  min={1}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Üyeler bu miktarı ödeyerek topluluk DAO hazinesine katkıda bulunacaklar
                </p>
              </div>
            )}
          </div>
          
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
