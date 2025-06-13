
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle } from 'lucide-react';

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
          alert('Bu galeye zaten eser gönderdiniz. Her galeri için sadece bir eser gönderebilirsiniz.');
        } else {
          alert('Eser gönderimi başarısız oldu');
        }
      } else {
        alert('Eser başarıyla gönderildi!');
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
      alert('Eser gönderimi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = new Date() > new Date(gallery.submission_deadline);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>"{gallery.title}" Galerisine Eser Gönder</DialogTitle>
        </DialogHeader>

        {isDeadlinePassed ? (
          <div className="text-center py-6">
            <p className="text-red-600 font-medium">
              Bu galeri için eser gönderim süresi dolmuştur.
            </p>
          </div>
        ) : (
          <>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Zorunlu Eser Gönderimi:</strong> Bu galeri onaylandığı için, her topluluk üyesinin en az bir eser göndermesi zorunludur. Satışlardan elde edilen gelir tüm üyeler arasında eşit paylaşılır.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Eser Başlığı</Label>
                <Input
                  id="title"
                  placeholder="Eser başlığını girin"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Eserinizi açıklayın"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Resim URL'si</Label>
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
                <Label htmlFor="price">Fiyat (ETH)</Label>
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
                <Label htmlFor="nftContract">NFT Kontrat Adresi (opsiyonel)</Label>
                <Input
                  id="nftContract"
                  placeholder="0x..."
                  value={formData.nftContract}
                  onChange={(e) => setFormData({ ...formData, nftContract: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="nftTokenId">NFT Token ID (opsiyonel)</Label>
                <Input
                  id="nftTokenId"
                  placeholder="Token ID"
                  value={formData.nftTokenId}
                  onChange={(e) => setFormData({ ...formData, nftTokenId: e.target.value })}
                />
              </div>
              
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <strong>Gelir Paylaşımı:</strong> Eseriniz satıldığında elde edilen gelir, topluluk içindeki tüm üyeler arasında eşit olarak dağıtılacaktır. Bu, dayanışma ve adil paylaşım ilkesini destekler.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                disabled={loading || !formData.title || !formData.imageUrl || !formData.price}
                className="w-full"
              >
                {loading ? 'Gönderiliyor...' : 'Eser Gönder'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
