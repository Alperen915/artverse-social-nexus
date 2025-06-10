
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, TrendingUp, Eye, Plus } from 'lucide-react';

interface NFTSale {
  id: string;
  nft_name: string;
  sale_price: number;
  currency: string;
  buyer_address: string;
  seller_address: string;
  transaction_hash: string;
  sale_date: string;
  community_share: number;
}

interface NFTSalesTrackerProps {
  communityId: string;
}

export const NFTSalesTracker = ({ communityId }: NFTSalesTrackerProps) => {
  const [sales, setSales] = useState<NFTSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSale, setNewSale] = useState({
    nft_name: '',
    sale_price: '',
    currency: 'ETH',
    buyer_address: '',
    seller_address: '',
    transaction_hash: '',
    community_share: '',
  });
  const { user } = useAuth();

  const fetchSales = async () => {
    try {
      // Note: We'll need to create this table in the database
      console.log('NFT sales tracking - would fetch from nft_sales table');
      // Simulated data for now
      setSales([
        {
          id: '1',
          nft_name: 'Community Genesis #001',
          sale_price: 2.5,
          currency: 'ETH',
          buyer_address: '0x742d35Cc6634C0532925a3b8D489C7F95c596e8f',
          seller_address: '0x8ba1f109551bD432803012645Hap000E06E29bAd',
          transaction_hash: '0x1234567890abcdef',
          sale_date: new Date().toISOString(),
          community_share: 0.25,
        },
      ]);
    } catch (error) {
      console.error('Error fetching NFT sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [communityId]);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // This would insert into nft_sales table when created
      console.log('Would add NFT sale:', newSale);
      alert('NFT sale tracked successfully!');
      setShowAddForm(false);
      setNewSale({
        nft_name: '',
        sale_price: '',
        currency: 'ETH',
        buyer_address: '',
        seller_address: '',
        transaction_hash: '',
        community_share: '',
      });
      fetchSales();
    } catch (error) {
      console.error('Error adding NFT sale:', error);
      alert('Failed to track NFT sale');
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.community_share, 0);
  const totalSales = sales.length;
  const avgSalePrice = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.sale_price, 0) / sales.length : 0;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading sales data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">NFT Sales Revenue</h2>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Track Sale
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} ETH</div>
            <p className="text-xs text-muted-foreground">
              Community share from sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              NFTs sold by community members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sale Price</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSalePrice.toFixed(2)} ETH</div>
            <p className="text-xs text-muted-foreground">
              Average across all sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Sale Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Track New NFT Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="NFT Name"
                  value={newSale.nft_name}
                  onChange={(e) => setNewSale({ ...newSale, nft_name: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  step="0.001"
                  placeholder="Sale Price"
                  value={newSale.sale_price}
                  onChange={(e) => setNewSale({ ...newSale, sale_price: e.target.value })}
                  required
                />
                <Input
                  placeholder="Buyer Address"
                  value={newSale.buyer_address}
                  onChange={(e) => setNewSale({ ...newSale, buyer_address: e.target.value })}
                  required
                />
                <Input
                  placeholder="Seller Address"
                  value={newSale.seller_address}
                  onChange={(e) => setNewSale({ ...newSale, seller_address: e.target.value })}
                  required
                />
                <Input
                  placeholder="Transaction Hash"
                  value={newSale.transaction_hash}
                  onChange={(e) => setNewSale({ ...newSale, transaction_hash: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  step="0.001"
                  placeholder="Community Share (ETH)"
                  value={newSale.community_share}
                  onChange={(e) => setNewSale({ ...newSale, community_share: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Track Sale
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Sales</h3>
        {sales.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No NFT sales tracked yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{sale.nft_name}</h4>
                      <p className="text-sm text-gray-600">
                        Sold for {sale.sale_price} {sale.currency} • Community earned {sale.community_share} ETH
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +{sale.community_share} ETH
                      </p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
