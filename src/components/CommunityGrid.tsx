import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, UserPlus, Shield } from 'lucide-react';
import { DAOCard } from '@/components/dao/DAOCard';
import { ArtverseTransferModal } from '@/components/dao/ArtverseTransferModal';
import { TokenBalanceDisplay } from '@/components/dao/TokenBalanceDisplay';

interface Community {
  id: string;
  name: string;
  description: string | null;
  genesis_nft_contract: string | null;
  token_gate_contract: string | null;
  token_gate_threshold: number | null;
  cover_image: string | null;
  created_at: string;
  member_count?: number;
  is_dao: boolean;
  bros_chain_address: string | null;
  membership_token_requirement: number;
  membership_is_free: boolean;
  dao_treasury_balance: number;
  artverse_status: 'local' | 'transferring' | 'transferred';
}

export const CommunityGrid = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [selectedDAO, setSelectedDAO] = useState<Community | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_memberships(count)
        `);

      if (error) {
        console.error('Error fetching communities:', error);
      } else {
        const communitiesWithCount = data?.map(community => ({
          ...community,
          member_count: community.community_memberships?.[0]?.count || 0,
          artverse_status: (community.artverse_status || 'local') as 'local' | 'transferring' | 'transferred'
        })) || [];
        setCommunities(communitiesWithCount);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTokenBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_token_balances')
        .select('balance')
        .eq('user_id', user.id)
        .eq('token_symbol', 'BROS')
        .single();

      if (!error && data) {
        setUserTokenBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    }
  };

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchUserTokenBalance();
    }
  }, [user]);

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      alert('Please sign in to join communities');
      return;
    }

    const community = communities.find(c => c.id === communityId);
    if (community && !community.membership_is_free && userTokenBalance < community.membership_token_requirement) {
      alert(`Bu DAO'ya katılmak için ${community.membership_token_requirement} BROS token gerekiyor. Mevcut bakiyeniz: ${userTokenBalance} BROS`);
      return;
    }

    try {
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        console.error('Error joining community:', error);
        if (error.code === '23505') {
          alert('You are already a member of this community');
        }
      } else {
        alert('Successfully joined the DAO!');
        fetchCommunities();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const viewCommunity = (communityId: string) => {
    navigate(`/community/${communityId}`);
  };

  const handleTransferToArtverse = (daoId: string) => {
    const dao = communities.find(c => c.id === daoId);
    if (dao) {
      setSelectedDAO(dao);
      setShowTransferModal(true);
    }
  };

  const handleTransferComplete = () => {
    fetchCommunities();
    setShowTransferModal(false);
    setSelectedDAO(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">DAO Communities</h2>
        <p className="text-muted-foreground">
          Bros Chain üzerindeki DAO topluluklarını keşfedin ve katılın
        </p>
      </div>

      {/* Token Balance Display */}
      <div className="max-w-md mx-auto">
        <TokenBalanceDisplay />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">DAO'lar yükleniyor...</p>
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Henüz DAO bulunamadı. İlk DAO'yu siz oluşturun!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <DAOCard
              key={community.id}
              dao={community}
              userTokenBalance={userTokenBalance}
              onJoin={joinCommunity}
              onView={viewCommunity}
              onTransferToArtverse={handleTransferToArtverse}
            />
          ))}
        </div>
      )}

      {/* Artverse Transfer Modal */}
      {selectedDAO && (
        <ArtverseTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          dao={selectedDAO}
          onTransferComplete={handleTransferComplete}
        />
      )}
    </div>
  );
};