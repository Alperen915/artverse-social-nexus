
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateGalleryProposalModal } from './CreateGalleryProposalModal';
import { SubmitArtworkModal } from './SubmitArtworkModal';
import { GallerySubmissions } from './GallerySubmissions';
import { GallerySubmissionRequirement } from './GallerySubmissionRequirement';
import { RevenueDistribution } from './RevenueDistribution';
import { ImageIcon, Plus, Calendar, DollarSign, Users } from 'lucide-react';

interface GalleryManagerProps {
  communityId: string;
}

interface Gallery {
  id: string;
  title: string;
  description: string;
  status: string;
  submission_deadline: string;
  total_revenue: number;
  created_at: string;
  proposal_id: string;
}

export const GalleryManager = ({ communityId }: GalleryManagerProps) => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const { user } = useAuth();

  const fetchGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_galleries')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching galleries:', error);
      } else {
        setGalleries(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, [communityId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Oylama Bekliyor';
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const handleSubmitArtwork = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setShowSubmitModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Galeriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">NFT Galerileri</h2>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Galeri Öner
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">NFT Galeri Sistemi Nasıl Çalışır?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Topluluk üyeleri galeri önerisi oluşturabilir</li>
          <li>• Galeri önerisi topluluk oylamasından geçmelidir</li>
          <li>• <strong>Onaylanan galerilere her üye ZORUNLU olarak en az bir eser göndermelidir</strong></li>
          <li>• Satışlardan elde edilen gelir TÜM topluluk üyeleri arasında eşit dağıtılır</li>
          <li>• Eser göndermemiş üyeler de gelir paylaşımından faydalanır</li>
        </ul>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Henüz galeri yok
          </h3>
          <p className="text-gray-600 mb-4">
            Topluluğunuz için ilk NFT galerisini önerin!
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Galeri Öner
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {galleries.map((gallery) => (
            <Card key={gallery.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{gallery.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{gallery.description}</p>
                  </div>
                  <Badge className={getStatusColor(gallery.status)}>
                    {getStatusText(gallery.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Son Tarih: {new Date(gallery.submission_deadline).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Toplam Gelir: {gallery.total_revenue} ETH
                  </div>
                </div>

                {gallery.status === 'active' && (
                  <>
                    <GallerySubmissionRequirement 
                      galleryId={gallery.id} 
                      communityId={communityId}
                    />
                    
                    <div className="flex gap-2 mb-4">
                      <Button
                        onClick={() => handleSubmitArtwork(gallery)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Eser Gönder
                      </Button>
                    </div>
                  </>
                )}

                <Tabs defaultValue="submissions" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="submissions" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Eserler
                    </TabsTrigger>
                    <TabsTrigger value="revenue" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Gelir Dağıtımı
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="submissions">
                    {gallery.status !== 'pending' && (
                      <GallerySubmissions galleryId={gallery.id} />
                    )}
                    {gallery.status === 'pending' && (
                      <div className="text-center py-6 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-800">Bu galeri hala oylama aşamasında</p>
                        <p className="text-sm text-yellow-600 mt-1">Oylama sonuçlanmadan eser gönderimi başlamaz</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="revenue">
                    <RevenueDistribution galleryId={gallery.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateGalleryProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        communityId={communityId}
      />

      {selectedGallery && (
        <SubmitArtworkModal
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedGallery(null);
          }}
          gallery={selectedGallery}
          onSubmissionComplete={fetchGalleries}
        />
      )}
    </div>
  );
};
