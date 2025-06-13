
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick }: ProfileHeaderProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.display_name || profile.username || 'Anonim Kullanıcı'}
              </h1>
              {profile.username && (
                <p className="text-gray-600">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Katılım: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          
          {isOwnProfile && (
            <Button
              onClick={onEditClick}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
