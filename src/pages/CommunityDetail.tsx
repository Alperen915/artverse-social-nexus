
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VotingSection } from '@/components/voting/VotingSection';
import { NFTSalesTracker } from '@/components/revenue/NFTSalesTracker';
import Header from '@/components/Header';
import { Users, Crown, ArrowLeft, Vote, DollarSign, ImageIcon } from 'lucide-react';

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

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchCommunity();
      checkMembership();
    }
  }, [id, user]);

  const fetchCommunity = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_memberships(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching community:', error);
      } else {
        setCommunity({
          ...data,
          member_count: data.community_memberships?.[0]?.count || 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsMember(true);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const joinCommunity = async () => {
    if (!user || !id) {
      alert('Please sign in to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: id,
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
        setIsMember(true);
        fetchCommunity();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Community not found</h1>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
        </div>

        {/* Community Header */}
        <Card className="mb-8">
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

          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {community.name}
                </h1>
                <p className="text-gray-600 mb-4">
                  {community.description || 'A vibrant community of digital artists and collectors.'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {community.member_count} members
                  </div>
                  {community.token_gate_threshold && (
                    <div className="text-purple-600 font-medium">
                      Min {community.token_gate_threshold} NFT{community.token_gate_threshold > 1 ? 's' : ''} required
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-6">
                {!isMember ? (
                  <Button 
                    onClick={joinCommunity}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Join Community
                  </Button>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    <Users className="w-3 h-3 mr-1" />
                    Member
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Content */}
        {isMember ? (
          <Tabs defaultValue="governance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="governance" className="flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Governance
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="governance">
              <VotingSection communityId={community.id} />
            </TabsContent>

            <TabsContent value="revenue">
              <NFTSalesTracker communityId={community.id} />
            </TabsContent>

            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>Community Gallery</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gallery feature coming soon!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Share and showcase your NFT artwork with the community.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Join to Access Community Features
              </h3>
              <p className="text-gray-600 mb-6">
                Become a member to participate in governance, track revenue, and access the community gallery.
              </p>
              <Button 
                onClick={joinCommunity}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Join Community
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
