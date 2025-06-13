
import { Card, CardContent } from '@/components/ui/card';
import { Users, ImageIcon, Calendar, Vote } from 'lucide-react';

interface UserStats {
  communitiesJoined: number;
  galleriesParticipated: number;
  proposalsCreated: number;
  eventsAttended: number;
}

interface UserStatsProps {
  stats: UserStats;
}

export const UserStatsComponent = ({ stats }: UserStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Topluluklar</p>
              <p className="text-2xl font-bold">{stats.communitiesJoined}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Galeri Katılımı</p>
              <p className="text-2xl font-bold">{stats.galleriesParticipated}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Öneriler</p>
              <p className="text-2xl font-bold">{stats.proposalsCreated}</p>
            </div>
            <Vote className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Etkinlikler</p>
              <p className="text-2xl font-bold">{stats.eventsAttended}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
