
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, ImageIcon, Vote, Calendar, TrendingUp } from 'lucide-react';

interface Stats {
  totalCommunities: number;
  totalMembers: number;
  activeGalleries: number;
  activeProposals: number;
  upcomingEvents: number;
}

export const PlatformStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalCommunities: 0,
    totalMembers: 0,
    activeGalleries: 0,
    activeProposals: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch community count
      const { count: communitiesCount } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true });

      // Fetch total members count
      const { count: membersCount } = await supabase
        .from('community_memberships')
        .select('*', { count: 'exact', head: true });

      // Fetch active galleries count
      const { count: galleriesCount } = await supabase
        .from('nft_galleries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch active proposals count
      const { count: proposalsCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch upcoming events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', new Date().toISOString());

      setStats({
        totalCommunities: communitiesCount || 0,
        totalMembers: membersCount || 0,
        activeGalleries: galleriesCount || 0,
        activeProposals: proposalsCount || 0,
        upcomingEvents: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Topluluklar',
      value: stats.totalCommunities,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Toplam Üye',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Aktif Galeriler',
      value: stats.activeGalleries,
      icon: ImageIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Aktif Oylamalar',
      value: stats.activeProposals,
      icon: Vote,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Yaklaşan Etkinlik',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
