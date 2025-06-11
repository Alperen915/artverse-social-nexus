
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, ArrowLeft } from 'lucide-react';

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

interface CommunityHeaderProps {
  community: Community;
  isMember: boolean;
  onJoin: () => void;
  onBack: () => void;
}

export const CommunityHeader = ({ community, isMember, onJoin, onBack }: CommunityHeaderProps) => {
  return (
    <>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Button>
      </div>

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
                  onClick={onJoin}
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
    </>
  );
};
