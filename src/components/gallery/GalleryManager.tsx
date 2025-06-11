
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateGalleryProposalModal } from './CreateGalleryProposalModal';
import { SubmitArtworkModal } from './SubmitArtworkModal';
import { GallerySubmissions } from './GallerySubmissions';
import { ImageIcon, Plus, Calendar, DollarSign } from 'lucide-react';

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

  const handleSubmitArtwork = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setShowSubmitModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading galleries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">NFT Galleries</h2>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Propose Gallery
        </Button>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No galleries yet
          </h3>
          <p className="text-gray-600 mb-4">
            Propose the first NFT gallery for your community!
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Propose Gallery
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
                    {gallery.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Deadline: {new Date(gallery.submission_deadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Revenue: ${gallery.total_revenue}
                    </div>
                  </div>

                  {gallery.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSubmitArtwork(gallery)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Submit Artwork
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedGallery(gallery)}
                      >
                        View Submissions
                      </Button>
                    </div>
                  )}

                  {gallery.status !== 'pending' && (
                    <GallerySubmissions galleryId={gallery.id} />
                  )}
                </div>
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
