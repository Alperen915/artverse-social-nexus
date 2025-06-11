
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

  const simulatePurchase = async (submission: Submission) => {
    if (!user) return;

    try {
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

      alert('Purchase successful! (Simulated)');
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
        <p className="text-gray-600">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Submitted Artworks ({submissions.length})</h4>
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
                  <Badge variant="secondary" className="text-xs">Sold</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
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
                    Buy Now
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
                    View on OpenSea <ExternalLink className="w-3 h-3" />
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
