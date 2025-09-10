import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, WalletIcon } from 'lucide-react';

export function WalletConnector() {
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Save wallet address to profile when connected
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (isConnected && address && user && !isSaving) {
        setIsSaving(true);
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ wallet_address: address })
            .eq('id', user.id);

          if (error) {
            console.error('Error saving wallet address:', error);
          } else {
            toast.success('Cüzdan adresi profilde kaydedildi');
          }
        } catch (error) {
          console.error('Error saving wallet address:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveWalletAddress();
  }, [isConnected, address, user, isSaving]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      toast.error(error.message || 'Cüzdan bağlanırken hata oluştu');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Cüzdan bağlantısı kesildi');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isConnected && address ? (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <WalletIcon className="w-3 h-3" />
            {address.slice(0, 6)}...{address.slice(-4)}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? 'Bağlanıyor...' : 'Cüzdan Bağla'}
        </Button>
      )}
    </div>
  );
}