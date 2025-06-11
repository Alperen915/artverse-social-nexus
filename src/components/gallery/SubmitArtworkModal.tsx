
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubmitArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: {
    id: string;
    title: string;
    submission_deadline: string;
  };
  onSubmissionComplete: () => void;
}

export const SubmitArtworkModal = ({ isOpen, onClose, gallery, onSubmissionComplete }: SubmitArtworkModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    nftContract: '',
    nftTokenId: '',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('gallery_submissions')
        .insert({
          gallery_id: gallery.id,
          submitter_id: user.id,
          title: formData.title,
          description: formData.description,
          image_url: formData.imageUrl,
          price: parseFloat(formData.price),
          nft_contract: formData.nftContract || null,
          nft_token_id: formData.nftTokenId || null,
        });

      if (error) {
        console.error('Error submitting artwork:', error);
        if (error.code === '23505') {
          alert('You have already submitted artwork to this gallery');
        } else {
          alert('Failed to submit artwork');
        }
      } else {
        alert('Artwork submitted successfully!');
        onSubmissionComplete();
        onClose();
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          price: '',
          nftContract: '',
          nftTokenId: '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit artwork');
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = new Date() > new Date(gallery.submission_deadline);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Artwork to "{gallery.title}"</DialogTitle>
        </DialogHeader>

        {isDeadlinePassed ? (
          <div className="text-center py-6">
            <p className="text-red-600 font-medium">
              Submission deadline has passed for this gallery.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Artwork Title</Label>
              <Input
                id="title"
                placeholder="Enter artwork title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your artwork"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/artwork.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price (ETH)</Label>
              <Input
                id="price"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="nftContract">NFT Contract Address (optional)</Label>
              <Input
                id="nftContract"
                placeholder="0x..."
                value={formData.nftContract}
                onChange={(e) => setFormData({ ...formData, nftContract: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="nftTokenId">NFT Token ID (optional)</Label>
              <Input
                id="nftTokenId"
                placeholder="Token ID"
                value={formData.nftTokenId}
                onChange={(e) => setFormData({ ...formData, nftTokenId: e.target.value })}
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
              <p><strong>Important:</strong> Each community member must submit exactly one artwork. Revenue from sales will be shared equally among all community members.</p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.imageUrl || !formData.price}
              className="w-full"
            >
              {loading ? 'Submitting...' : 'Submit Artwork'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
