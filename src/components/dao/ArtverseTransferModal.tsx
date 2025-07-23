import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ArtverseTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  dao: {
    id: string;
    name: string;
    description: string;
    bros_chain_address: string;
    dao_treasury_balance: number;
    member_count?: number;
  };
  onTransferComplete?: () => void;
}

export const ArtverseTransferModal = ({ 
  isOpen, 
  onClose, 
  dao,
  onTransferComplete 
}: ArtverseTransferModalProps) => {
  const [transferStep, setTransferStep] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const transferSteps = [
    { title: 'Hazırlık', description: 'DAO verilerini doğrulama' },
    { title: 'Bros Chain', description: 'Blockchain üzerinde kayıt' },
    { title: 'Artverse', description: 'Artverse platformuna aktarım' },
    { title: 'Tamamlandı', description: 'Transfer başarıyla tamamlandı' }
  ];

  const handleTransfer = async () => {
    if (!user) {
      setError('Oturum açmanız gerekiyor');
      return;
    }

    setIsTransferring(true);
    setError(null);

    try {
      // Step 1: Preparation
      setTransferStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Bros Chain Registration (simulated)
      setTransferStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create transfer record
      const transferData = {
        community_id: dao.id,
        initiated_by: user.id,
        transfer_status: 'pending',
        artverse_dao_id: `artverse_${dao.id}`,
        bros_chain_tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        metadata: {
          original_name: dao.name,
          treasury_balance: dao.dao_treasury_balance,
          member_count: dao.member_count || 0
        }
      };

      const { error: transferError } = await supabase
        .from('artverse_transfers')
        .insert(transferData);

      if (transferError) {
        throw transferError;
      }

      // Step 3: Artverse Transfer (simulated)
      setTransferStep(3);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update community status
      const { error: updateError } = await supabase
        .from('communities')
        .update({
          artverse_status: 'transferred',
          artverse_transfer_date: new Date().toISOString()
        })
        .eq('id', dao.id);

      if (updateError) {
        throw updateError;
      }

      // Complete transfer record
      const { error: completeError } = await supabase
        .from('artverse_transfers')
        .update({
          transfer_status: 'completed',
          completion_date: new Date().toISOString()
        })
        .eq('community_id', dao.id)
        .eq('transfer_status', 'pending');

      if (completeError) {
        throw completeError;
      }

      // Step 4: Completed
      setTransferStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));

      onTransferComplete?.();
      
      setTimeout(() => {
        onClose();
        setTransferStep(0);
        setIsTransferring(false);
      }, 2000);

    } catch (error) {
      console.error('Transfer error:', error);
      setError('Transfer sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-purple-600" />
            Artverse'e Aktar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* DAO Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium">{dao.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {dao.description}
            </div>
            <div className="flex gap-4 text-xs">
              <span>Hazine: {dao.dao_treasury_balance?.toLocaleString()} BROS</span>
              <span>Üyeler: {dao.member_count || 0}</span>
            </div>
          </div>

          {/* Transfer Progress */}
          {isTransferring && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Transfer İlerleme</span>
                  <span>{Math.round((transferStep / 4) * 100)}%</span>
                </div>
                <Progress value={(transferStep / 4) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                {transferSteps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded ${
                      index < transferStep ? 'bg-green-50' : 
                      index === transferStep ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {index < transferStep ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : index === transferStep ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {transferStep === 4 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                DAO başarıyla Artverse'e aktarıldı! Artık Artverse üzerinden yönetilebilir.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning */}
          {!isTransferring && transferStep === 0 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Bu işlem geri alınamaz. DAO Artverse'e aktarıldıktan sonra sadece 
                Artverse üzerinden yönetilebilir.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {!isTransferring && transferStep === 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                onClick={handleTransfer}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowRight className="w-4 h-4 mr-1" />
                Aktar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};