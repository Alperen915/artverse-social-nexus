
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';

interface CommunityJoinPromptProps {
  onJoin: () => void;
}

export const CommunityJoinPrompt = ({ onJoin }: CommunityJoinPromptProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Join to Access Community Features
        </h3>
        <p className="text-gray-600 mb-6">
          Become a member to participate in governance, create galleries, track revenue, and access community features.
        </p>
        <Button 
          onClick={onJoin}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Join Community
        </Button>
      </CardContent>
    </Card>
  );
};
