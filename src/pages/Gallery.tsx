
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageIcon, Users, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Gallery {
  id: string;
  title: string;
  description: string;
  status: string;
  submission_deadline: string;
  total_revenue: number;
  created_at: string;
  communities: {
    name: string;
    id: string;
  };
  gallery_submissions: { count: number }[];
}

const Gallery = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_galleries')
        .select(`
          *,
          communities!left (name, id),
          gallery_submissions!left (id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching galleries:', error);
        setGalleries([]);
      } else {
        // Process galleries with submission count
        const galleriesWithCounts = (data || []).map(gallery => ({
          ...gallery,
          gallery_submissions: [{ count: gallery.gallery_submissions?.length || 0 }]
        }));
        setGalleries(galleriesWithCounts);
      }
    } catch (error) {
      console.error('Error:', error);
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Galeriler yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            NFT Galerileri
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Topluluklar tarafından oluşturulan NFT galerilerini keşfedin
          </p>
        </div>

        {galleries.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Henüz aktif galeri bulunmuyor.
              </p>
              <p className="text-sm text-gray-500">
                Topluluklar galeri önerileri oluşturabilir ve oylama sonrasında galeriler aktif hale gelir.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => (
              <Card key={gallery.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{gallery.title}</CardTitle>
                    <Badge className={getStatusColor(gallery.status)}>
                      Aktif
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{gallery.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {gallery.communities?.name || 'Topluluk'}
                    </div>
                    <div className="flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {gallery.gallery_submissions?.[0]?.count || 0} Eser
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Son Tarih: {new Date(gallery.submission_deadline).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="font-semibold">
                      {gallery.total_revenue} ETH
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/community/${gallery.communities?.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Topluluğa Git
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
