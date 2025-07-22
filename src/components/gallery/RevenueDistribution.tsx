
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Users } from 'lucide-react';

interface RevenueDistributionProps {
  galleryId: string;
}

interface Distribution {
  id: string;
  amount: number;
  distributed_at: string;
  transaction_hash: string | null;
}

export const RevenueDistribution = ({ galleryId }: RevenueDistributionProps) => {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDistributions();
    }
  }, [galleryId, user]);

  const fetchDistributions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('revenue_distributions')
        .select('*')
        .eq('gallery_id', galleryId)
        .eq('member_id', user.id);
      const { data: members, error: membersError } = await supabase
        .from('gallery_members')
        .select('user_id');

      if (error) {
        console.error('Error fetching distributions:', error);
      } else {
        setDistributions(data || []);
        const total = (data || []).reduce((sum, dist) => sum + Number(dist.amount), 0);
        setTotalEarnings(total);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Gelir dağıtımları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Gelir Dağıtımlarım
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">Toplam Kazanç</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{totalEarnings.toFixed(4)} ETH</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Dağıtım Sayısı</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{distributions.length}</p>
            </div>
          </div>

          {distributions.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Henüz gelir dağıtımınız bulunmuyor</p>
              <p className="text-sm text-gray-500 mt-1">Galeride satış gerçekleştiğinde buraya görünecek</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">Dağıtım Geçmişi</h5>
              {distributions.map((distribution) => (
                <div key={distribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{Number(distribution.amount).toFixed(4)} ETH</p>
                    <p className="text-sm text-gray-600">
                      {new Date(distribution.distributed_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  {distribution.transaction_hash && (
                    <div className="text-xs text-gray-500">
                      TX: {distribution.transaction_hash.slice(0, 8)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
