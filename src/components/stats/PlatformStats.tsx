
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
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id');

      // Fetch total members count
      const { data: members, error: membersError } = await supabase
        .from('community_memberships')
        .select('id');

      // Fetch active galleries count
      const { data: galleries, error: galleriesError } = await supabase
        .from('nft_galleries')
        .select('id')
        .eq('status', 'active');

      // Fetch active proposals count
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('id')
        .eq('status', 'active');

      // Fetch upcoming events count
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .gte('event_date', new Date().toISOString());

      // Handle any errors
      if (communitiesError) console.error('Error fetching communities:', communitiesError);
      if (membersError) console.error('Error fetching members:', membersError);
      if (galleriesError) console.error('Error fetching galleries:', galleriesError);
      if (proposalsError) console.error('Error fetching proposals:', proposalsError);
      if (eventsError) console.error('Error fetching events:', eventsError);

      setStats({
        totalCommunities: communities?.length || 0,
        totalMembers: members?.length || 0,
        activeGalleries: galleries?.length || 0,
        activeProposals: proposals?.length || 0,
        upcomingEvents: events?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Set default values on error
      setStats({
        totalCommunities: 0,
        totalMembers: 0,
        activeGalleries: 0,
        activeProposals: 0,
        upcomingEvents: 0,
      });
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
