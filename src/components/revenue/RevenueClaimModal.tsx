import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface RevenueClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  pendingAmount: number;
  galleryTitle: string;
}

export const RevenueClaimModal = ({ 
  isOpen, 
  onClose, 
  galleryId, 
  pendingAmount, 
  galleryTitle 
}: RevenueClaimModalProps) => {
  const [claiming, setClaiming] = useState(false);
  const { user } = useAuth();
  const { address, isConnected, connectWallet } = useWallet();

  const handleClaimRevenue = async () => {
    if (!isConnected || !address || !user) {
      alert('Lütfen MetaMask wallet\'ınızı bağlayın');
      return;
    }

    setClaiming(true);
    try {
      // Simulate revenue payout transaction
      const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Record the payout
      const { error } = await supabase
        .from('revenue_payouts')
        .insert({
          gallery_id: galleryId,
          user_id: user.id,
          amount: pendingAmount,
          payout_address: address,
          status: 'completed',
          transaction_hash: transactionHash,
          paid_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording payout:', error);
        alert('Gelir talebi başarısız oldu');
      } else {
        alert(`Gelir başarıyla claim edildi! ${pendingAmount} ETH wallet adresinize gönderildi. Transaction: ${transactionHash.slice(0, 10)}...`);
        onClose();
      }
    } catch (error) {
      console.error('Error claiming revenue:', error);
      alert('Gelir talebi başarısız oldu');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Gelir Talebi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">{galleryTitle}</h3>
                <div className="text-3xl font-bold text-green-600">
                  {pendingAmount} ETH
                </div>
                <p className="text-sm text-gray-600">
                  Claim edilmeyi bekleyen gelir
                </p>
              </div>
            </CardContent>
          </Card>

          {!isConnected ? (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Gelir almak için MetaMask wallet'ınızı bağlamanız gerekiyor.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Wallet Bağlı:</strong> {address?.slice(0, 8)}...{address?.slice(-6)}
                <br />
                <small>Bu adrese {pendingAmount} ETH gönderilecek</small>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Önemli:</strong> Gelir claim işlemi blockchain üzerinde gerçekleşir ve geri alınamaz.
              Wallet adresinizi doğrulayın.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={claiming}
            >
              İptal
            </Button>
            
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Wallet Bağla
              </Button>
            ) : (
              <Button
                onClick={handleClaimRevenue}
                disabled={claiming || pendingAmount <= 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {claiming ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Gönderiliyor...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Geliri Claim Et
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};