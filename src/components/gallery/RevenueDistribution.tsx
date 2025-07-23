import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RevenueClaimModal } from '@/components/revenue/RevenueClaimModal';
import { DollarSign, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface RevenueDistributionProps {
  galleryId: string;
}

interface RevenueData {
  total_revenue: number;
  total_sales: number;
  average_sale_price: number;
  gallery_title?: string;
}

interface UserRevenuePayout {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string;
  transaction_hash: string;
}

export const RevenueDistribution = ({ galleryId }: RevenueDistributionProps) => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [userPayouts, setUserPayouts] = useState<UserRevenuePayout[]>([]);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRevenueData = async () => {
    try {
      // Fetch gallery sales data
      const { data: salesData, error: salesError } = await supabase
        .from('gallery_sales')
        .select(`
          sale_price,
          gallery_submissions!inner (
            gallery_id,
            nft_galleries!inner (
              title
            )
          )
        `)
        .eq('gallery_submissions.gallery_id', galleryId);

      if (salesError) {
        console.error('Error fetching revenue data:', salesError);
      } else {
        const sales = salesData || [];
        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.sale_price), 0);
        const totalSales = sales.length;
        const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;
        const galleryTitle = sales[0]?.gallery_submissions?.nft_galleries?.title || '';

        setRevenueData({
          total_revenue: totalRevenue,
          total_sales: totalSales,
          average_sale_price: averageSalePrice,
          gallery_title: galleryTitle
        });
      }

      // Fetch user's revenue payouts
      if (user) {
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('revenue_payouts')
          .select('*')
          .eq('gallery_id', galleryId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (payoutsError) {
          console.error('Error fetching user payouts:', payoutsError);
        } else {
          setUserPayouts(payoutsData || []);
        }

        // Calculate pending revenue using the database function
        const { data: distributionData, error: distributionError } = await supabase
          .rpc('distribute_gallery_revenue', { gallery_id_param: galleryId });

        if (distributionError) {
          console.error('Error calculating revenue distribution:', distributionError);
        } else {
          const userDistribution = distributionData?.find(d => d.user_id === user.id);
          const totalPaidOut = (payoutsData || [])
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount), 0);
          
          const pendingAmount = userDistribution ? Number(userDistribution.payout_amount) - totalPaidOut : 0;
          setPendingRevenue(Math.max(0, pendingAmount));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [galleryId, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">İşleniyor</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Gelir verileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData?.total_revenue || 0} ETH</div>
            <p className="text-xs text-muted-foreground">
              Tüm NFT satışlarından
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData?.total_sales || 0}</div>
            <p className="text-xs text-muted-foreground">
              Satılan NFT sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Fiyat</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData?.average_sale_price?.toFixed(4) || 0} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              NFT başına ortalama
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Revenue Section */}
      {user && (
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sizin Gelir Durumunuz</CardTitle>
              {pendingRevenue > 0 && (
                <Button
                  onClick={() => setShowClaimModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Gelir Talep Et
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Bekleyen Gelir</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {pendingRevenue.toFixed(6)} ETH
                </div>
                <p className="text-sm text-green-700">
                  Claim edilmeyi bekliyor
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Toplam Alınan</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {userPayouts
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                    .toFixed(6)} ETH
                </div>
                <p className="text-sm text-blue-700">
                  Şimdiye kadar alınan
                </p>
              </div>
            </div>

            {userPayouts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Ödeme Geçmişi</h4>
                <div className="space-y-2">
                  {userPayouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{Number(payout.amount).toFixed(6)} ETH</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payout.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(payout.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gelir Dağıtım Politikası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• NFT satışlarından elde edilen gelir, galeriye katkıda bulunan tüm topluluk üyelerine eşit olarak dağıtılır</p>
            <p>• Galeri onaylandıktan sonra en az 1 NFT gönderen her üye gelir paylaşımından faydalanır</p>
            <p>• Dağıtım otomatik olarak hesaplanır ve talep üzerine ödenir</p>
            <p>• Tüm ödemeler blockchain üzerinde şeffaf olarak gerçekleştirilir</p>
            <p>• <strong>Gelir almak için MetaMask wallet'ınızı bağlamanız gerekiyor</strong></p>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Claim Modal */}
      <RevenueClaimModal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          fetchRevenueData(); // Refresh data after claim
        }}
        galleryId={galleryId}
        pendingAmount={pendingRevenue}
        galleryTitle={revenueData?.gallery_title || 'NFT Galerisi'}
      />
    </div>
  );
};