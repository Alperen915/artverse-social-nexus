
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ExternalLink } from 'lucide-react';

interface GallerySubmissionsProps {
  galleryId: string;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  sold: boolean;
  submitter_id: string;
  nft_contract: string | null;
  nft_token_id: string | null;
}

export const GallerySubmissions = ({ galleryId }: GallerySubmissionsProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSubmissions();
  }, [galleryId]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_submissions')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
      } else {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributeRevenue = async (salePrice: number, communityId: string) => {
    try {
      // Get all community members
      const { data: members, error: membersError } = await supabase
        .from('community_memberships')
        .select('user_id')
        .eq('community_id', communityId);

      if (membersError) {
        console.error('Error fetching community members:', membersError);
        return;
      }

      if (members && members.length > 0) {
        const sharePerMember = salePrice / members.length;
        
        // Create revenue distribution records for each member
        const distributions = members.map(member => ({
          gallery_id: galleryId,
          member_id: member.user_id,
          amount: sharePerMember,
          transaction_hash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated tx hash
        }));

        const { error: distributionError } = await supabase
          .from('revenue_distributions')
          .insert(distributions);

        if (distributionError) {
          console.error('Error creating revenue distributions:', distributionError);
        } else {
          console.log(`Revenue distributed: ${sharePerMember} ETH to each of ${members.length} members`);
        }
      }
    } catch (error) {
      console.error('Error distributing revenue:', error);
    }
  };

  const simulatePurchase = async (submission: Submission) => {
    if (!user) return;

    try {
      // First get the community ID for this gallery
      const { data: gallery, error: galleryError } = await supabase
        .from('nft_galleries')
        .select('community_id')
        .eq('id', galleryId)
        .single();

      if (galleryError) {
        console.error('Error fetching gallery:', galleryError);
        alert('Failed to fetch gallery information');
        return;
      }

      // Simulate a purchase by recording a sale
      const { error: saleError } = await supabase
        .from('gallery_sales')
        .insert({
          submission_id: submission.id,
          buyer_address: '0x' + Math.random().toString(16).substr(2, 40), // Simulated buyer address
          sale_price: submission.price,
          transaction_hash: '0x' + Math.random().toString(16).substr(2, 64), // Simulated tx hash
        });

      if (saleError) {
        console.error('Error recording sale:', saleError);
        alert('Failed to process purchase');
        return;
      }

      // Mark as sold
      const { error: updateError } = await supabase
        .from('gallery_submissions')
        .update({ sold: true })
        .eq('id', submission.id);

      if (updateError) {
        console.error('Error updating submission:', updateError);
      }

      // Distribute revenue to all community members
      await distributeRevenue(submission.price, gallery.community_id);

      // Update gallery total revenue
      const { error: revenueError } = await supabase
        .from('nft_galleries')
        .update({ 
          total_revenue: supabase.raw(`total_revenue + ${submission.price}`)
        })
        .eq('id', galleryId);

      if (revenueError) {
        console.error('Error updating gallery revenue:', revenueError);
      }

      alert(`Purchase successful! Revenue (${submission.price} ETH) distributed equally among all community members.`);
      fetchSubmissions();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process purchase');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Henüz eser gönderimi yok</p>
        <p className="text-sm text-gray-500 mt-1">Topluluk üyelerinin eser göndermesi bekleniyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Gönderilen Eserler ({submissions.length})</h4>
      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
        <p><strong>Gelir Dağıtımı:</strong> Her satıştan elde edilen gelir, topluluk üyeleri arasında eşit olarak dağıtılır.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img
                src={submission.image_url}
                alt={submission.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-sm">{submission.title}</h5>
                {submission.sold ? (
                  <Badge variant="secondary" className="text-xs">Satıldı</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 text-xs">Mevcut</Badge>
                )}
              </div>
              
              {submission.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {submission.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{submission.price} ETH</span>
                {!submission.sold && (
                  <Button
                    size="sm"
                    onClick={() => simulatePurchase(submission)}
                    className="text-xs px-2 py-1"
                  >
                    Satın Al
                  </Button>
                )}
              </div>
              
              {submission.nft_contract && (
                <div className="mt-2 pt-2 border-t">
                  <a
                    href={`https://opensea.io/assets/ethereum/${submission.nft_contract}/${submission.nft_token_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    OpenSea'da Görüntüle <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
