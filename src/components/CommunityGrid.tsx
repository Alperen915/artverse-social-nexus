
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Crown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

const CommunityGrid = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_memberships(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching communities:', error);
      } else {
        // Process the data to include member count
        const communitiesWithCounts = data?.map(community => ({
          ...community,
          member_count: community.community_memberships?.[0]?.count || 0
        })) || [];
        setCommunities(communitiesWithCounts);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      alert('Please sign in to join communities');
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
        alert('Successfully joined the community!');
        fetchCommunities(); // Refresh to update member count
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const viewCommunity = (communityId: string) => {
    navigate(`/community/${communityId}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loading Communities...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Art Communities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join token-gated communities, participate in governance, and connect with artists worldwide
          </p>
        </div>

        {communities.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              No communities yet
            </h3>
            <p className="text-gray-600 mb-8">
              Be the first to create a community and start building your artistic collective!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communities.map((community) => (
              <Card key={community.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <div className="h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-t-lg relative overflow-hidden">
                  {community.cover_image ? (
                    <img 
                      src={community.cover_image} 
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
                  )}
                  <div className="absolute top-4 right-4">
                    {community.token_gate_contract && (
                      <Badge variant="secondary" className="bg-white/90 text-purple-700">
                        <Crown className="w-3 h-3 mr-1" />
                        Token Gated
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {community.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {community.description || 'A vibrant community of digital artists and collectors.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {community.member_count} members
                    </div>
                    {community.token_gate_threshold && (
                      <div className="text-xs text-purple-600 font-medium">
                        Min {community.token_gate_threshold} NFT{community.token_gate_threshold > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => joinCommunity(community.id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Join Community
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-4"
                      onClick={() => viewCommunity(community.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunityGrid;
