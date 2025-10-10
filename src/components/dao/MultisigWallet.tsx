import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Users, Send, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MultisigWallet {
  id: string;
  required_signatures: number;
  signers: string[];
  wallet_address?: string;
}

interface PendingTransaction {
  id: string;
  amount: number;
  to_address: string;
  description: string;
  signatures: string[];
  status: string;
  created_at: string;
}

interface MultisigWalletProps {
  communityId: string;
}

export function MultisigWallet({ communityId }: MultisigWalletProps) {
  const [wallet, setWallet] = useState<MultisigWallet | null>(null);
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [newWallet, setNewWallet] = useState({
    required_signatures: 2,
    signers: ['', '']
  });

  const [newTx, setNewTx] = useState({
    amount: '',
    to_address: '',
    description: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, [communityId]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      const { data: walletData, error: walletError } = await supabase
        .from('dao_multisig_wallets')
        .select('*')
        .eq('community_id', communityId)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;
      setWallet(walletData);

      if (walletData) {
        const { data: txData, error: txError } = await supabase
          .from('pending_multisig_transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (txError) throw txError;
        setPendingTxs(txData || []);
      }
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!user) return;

    try {
      const validSigners = newWallet.signers.filter(s => s.trim() !== '');
      
      if (validSigners.length < 2) {
        toast({
          title: 'Hata',
          description: 'En az 2 imzalayan gerekli',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('dao_multisig_wallets')
        .insert({
          community_id: communityId,
          required_signatures: newWallet.required_signatures,
          signers: validSigners
        });

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Multi-sig cüzdan oluşturuldu',
      });

      setCreateModalOpen(false);
      fetchWalletData();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateTransaction = async () => {
    if (!user || !wallet) return;

    try {
      const { error } = await supabase
        .from('pending_multisig_transactions')
        .insert({
          wallet_id: wallet.id,
          amount: parseFloat(newTx.amount),
          to_address: newTx.to_address,
          description: newTx.description,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'İşlem önerisi oluşturuldu',
      });

      setTxModalOpen(false);
      setNewTx({ amount: '', to_address: '', description: '' });
      fetchWalletData();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignTransaction = async (txId: string, currentSignatures: string[]) => {
    if (!user) return;

    try {
      const newSignatures = [...currentSignatures, user.id];

      const { error } = await supabase
        .from('pending_multisig_transactions')
        .update({ signatures: newSignatures })
        .eq('id', txId);

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'İşlem imzalandı',
      });

      fetchWalletData();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-sig Cüzdan</CardTitle>
          <CardDescription>
            DAO hazinesi için çoklu imza cüzdanı oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="mr-2 h-4 w-4" />
                Multi-sig Cüzdan Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Multi-sig Cüzdan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Gerekli İmza Sayısı</Label>
                  <Input
                    type="number"
                    min={2}
                    value={newWallet.required_signatures}
                    onChange={(e) => setNewWallet({
                      ...newWallet,
                      required_signatures: parseInt(e.target.value)
                    })}
                  />
                </div>
                {newWallet.signers.map((signer, index) => (
                  <div key={index}>
                    <Label>İmzalayan {index + 1}</Label>
                    <Input
                      placeholder="Wallet adresi veya kullanıcı ID"
                      value={signer}
                      onChange={(e) => {
                        const newSigners = [...newWallet.signers];
                        newSigners[index] = e.target.value;
                        setNewWallet({ ...newWallet, signers: newSigners });
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setNewWallet({
                    ...newWallet,
                    signers: [...newWallet.signers, '']
                  })}
                >
                  <Users className="mr-2 h-4 w-4" />
                  İmzalayan Ekle
                </Button>
                <Button onClick={handleCreateWallet} className="w-full">
                  Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-sig Cüzdan
          </CardTitle>
          <CardDescription>
            {wallet.required_signatures}/{wallet.signers.length} imza gerekli
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={txModalOpen} onOpenChange={setTxModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Yeni İşlem Öner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni İşlem Önerisi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Miktar (BROS)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Alıcı Adresi</Label>
                  <Input
                    value={newTx.to_address}
                    onChange={(e) => setNewTx({ ...newTx, to_address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <Textarea
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateTransaction} className="w-full">
                  İşlem Öner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bekleyen İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTxs.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.amount} BROS → {tx.to_address.slice(0, 10)}...
                    </p>
                  </div>
                  <div className="text-sm">
                    {tx.signatures.length}/{wallet.required_signatures} imza
                  </div>
                </div>
                {!tx.signatures.includes(user?.id || '') && (
                  <Button
                    size="sm"
                    onClick={() => handleSignTransaction(tx.id, tx.signatures)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    İmzala
                  </Button>
                )}
              </div>
            ))}
            {pendingTxs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Bekleyen işlem yok
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
