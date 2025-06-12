
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CommunityGrid from '@/components/CommunityGrid';
import { supabase } from '@/integrations/supabase/client';

interface Community {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  member_count?: number;
}

const Index = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

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
        const communitiesWithCount = data?.map(community => ({
          ...community,
          member_count: community.community_memberships?.[0]?.count || 0
        })) || [];
        setCommunities(communitiesWithCount);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Topluluklar
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sanat topluluklarına katılın ve NFT ekosisteminin bir parçası olun
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Topluluklar yükleniyor...</p>
          </div>
        ) : (
          <CommunityGrid communities={communities} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
