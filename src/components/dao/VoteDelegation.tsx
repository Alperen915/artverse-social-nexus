import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, UserMinus, Vote } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Delegation {
  id: string;
  delegate_id: string;
  delegator_id: string;
  active: boolean;
  created_at: string;
}

interface VoteDelegationProps {
  communityId: string;
}

export function VoteDelegation({ communityId }: VoteDelegationProps) {
  const [myDelegation, setMyDelegation] = useState<Delegation | null>(null);
  const [delegationsToMe, setDelegationsToMe] = useState<Delegation[]>([]);
  const [delegateAddress, setDelegateAddress] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDelegations();
    }
  }, [communityId, user]);

  const fetchDelegations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch my delegation
      const { data: myDel, error: myError } = await supabase
        .from('vote_delegations')
        .select('*')
        .eq('delegator_id', user.id)
        .eq('community_id', communityId)
        .eq('active', true)
        .maybeSingle();

      if (myError && myError.code !== 'PGRST116') throw myError;
      setMyDelegation(myDel);

      // Fetch delegations to me
      const { data: toMe, error: toMeError } = await supabase
        .from('vote_delegations')
        .select('*')
        .eq('delegate_id', user.id)
        .eq('community_id', communityId)
        .eq('active', true);

      if (toMeError) throw toMeError;
      setDelegationsToMe(toMe || []);
    } catch (error: any) {
      console.error('Error fetching delegations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelegate = async () => {
    if (!user || !delegateAddress.trim()) return;

    try {
      const { error } = await supabase
        .from('vote_delegations')
        .insert({
          delegator_id: user.id,
          delegate_id: delegateAddress,
          community_id: communityId,
          active: true
        });

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Oy gücünüz devredildi',
      });

      setModalOpen(false);
      setDelegateAddress('');
      fetchDelegations();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRevokeDelegate = async () => {
    if (!user || !myDelegation) return;

    try {
      const { error } = await supabase
        .from('vote_delegations')
        .update({ active: false })
        .eq('id', myDelegation.id);

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Oy gücü devrini iptal ettiniz',
      });

      fetchDelegations();
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

  const totalVotingPower = 1 + delegationsToMe.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Oy Gücü Yönetimi
          </CardTitle>
          <CardDescription>
            Oy gücünüzü başkasına devredebilir veya size devredilen oyları görebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Toplam Oy Gücünüz</p>
            <p className="text-3xl font-bold">{totalVotingPower}</p>
            <p className="text-sm text-muted-foreground mt-1">
              1 kendi oyunuz + {delegationsToMe.length} devredilmiş oy
            </p>
          </div>

          {myDelegation ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Oy gücünüz devredildi</p>
                  <p className="text-sm text-muted-foreground">
                    {myDelegation.delegate_id.slice(0, 10)}...
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleRevokeDelegate}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  İptal Et
                </Button>
              </div>
            </div>
          ) : (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Oy Gücünü Devret
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Oy Gücünü Devret</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Delege (Kullanıcı ID veya Wallet)</Label>
                    <Input
                      placeholder="Kime oy gücünüzü devretmek istiyorsunuz?"
                      value={delegateAddress}
                      onChange={(e) => setDelegateAddress(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Bu kişi sizin adınıza oylamada oy kullanabilecek
                    </p>
                  </div>
                  <Button onClick={handleDelegate} className="w-full">
                    Devret
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Size Devredilen Oylar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {delegationsToMe.map((del) => (
              <div key={del.id} className="border rounded-lg p-3">
                <p className="text-sm font-medium">
                  {del.delegator_id.slice(0, 10)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(del.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
            {delegationsToMe.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Size devredilmiş oy yok
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
