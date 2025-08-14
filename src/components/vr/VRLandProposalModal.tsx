import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Headset, MapPin, Coins } from 'lucide-react';

interface VRLandProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
}

export const VRLandProposalModal = ({ isOpen, onClose, communityId }: VRLandProposalModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    landSize: 'medium',
    landTheme: 'modern',
    maxNFTs: 20,
    votingDays: 7,
    vrCost: 100
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const landSizes = {
    small: { name: 'Small (10x10)', maxNFTs: 10, cost: 50 },
    medium: { name: 'Medium (20x20)', maxNFTs: 20, cost: 100 },
    large: { name: 'Large (30x30)', maxNFTs: 35, cost: 200 },
    mega: { name: 'Mega (50x50)', maxNFTs: 60, cost: 500 }
  };

  const landThemes = {
    modern: 'Modern Gallery',
    classical: 'Classical Museum',
    futuristic: 'Futuristic Space',
    nature: 'Natural Environment',
    cyberpunk: 'Cyberpunk City',
    minimalist: 'Minimalist White'
  };

  const handleSizeChange = (size: string) => {
    const sizeConfig = landSizes[size as keyof typeof landSizes];
    setFormData({
      ...formData,
      landSize: size,
      maxNFTs: sizeConfig.maxNFTs,
      vrCost: sizeConfig.cost
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Giriş Gerekli",
        description: "VR arazi önerisi oluşturmak için giriş yapmalısınız",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const votingEnd = new Date();
      votingEnd.setDate(votingEnd.getDate() + formData.votingDays);
      votingEnd.setHours(23, 59, 59, 999);

      const proposalTitle = `VR Arazi: ${formData.title}`;
      const proposalDescription = `
VR Galeri Arazi Önerisi

Arazi Adı: ${formData.title}
Açıklama: ${formData.description}

Teknik Özellikler:
- Arazi Boyutu: ${landSizes[formData.landSize as keyof typeof landSizes].name}
- Maksimum NFT Kapasitesi: ${formData.maxNFTs} adet
- Tema: ${landThemes[formData.landTheme as keyof typeof landThemes]}
- Maliyet: ${formData.vrCost} BROS

Bu öneride VR teknolojisi kullanılarak sanal bir galeri arazisi oluşturulacak. Onaylanırsa, DAO üyeleri bu arazide NFT'lerini 3D ortamda sergileyebilecek.
      `.trim();

      const { error } = await supabase
        .from('proposals')
        .insert({
          title: proposalTitle,
          description: proposalDescription,
          proposal_type: 'vr_land',
          community_id: communityId,
          creator_id: user.id,
          voting_end: votingEnd.toISOString(),
        });

      if (error) {
        console.error('Error creating VR land proposal:', error);
        toast({
          title: "Hata",
          description: "VR arazi önerisi oluşturulamadı",
          variant: "destructive",
        });
      } else {
        onClose();
        setFormData({
          title: '',
          description: '',
          landSize: 'medium',
          landTheme: 'modern',
          maxNFTs: 20,
          votingDays: 7,
          vrCost: 100
        });
        toast({
          title: "Öneri Oluşturuldu",
          description: "VR arazi öneriniz oylamaya sunuldu!",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headset className="w-5 h-5 text-primary" />
            VR Arazi Önerisi Oluştur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Arazi Adı</Label>
              <Input
                id="title"
                placeholder="ör. Sanat Merkezi VR"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="votingDays">Oylama Süresi (gün)</Label>
              <Input
                id="votingDays"
                type="number"
                min="1"
                max="14"
                value={formData.votingDays}
                onChange={(e) => setFormData({ ...formData, votingDays: Math.min(14, Number(e.target.value)) })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="VR arazisi için vizyonunuzu açıklayın..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Arazi Boyutu</Label>
              <Select value={formData.landSize} onValueChange={handleSizeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(landSizes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center justify-between w-full">
                        <span>{config.name}</span>
                        <span className="ml-4 text-muted-foreground">{config.cost} BROS</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Galeri Teması</Label>
              <Select value={formData.landTheme} onValueChange={(value) => setFormData({ ...formData, landTheme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(landThemes).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Arazi Özellikleri
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Boyut:</span>
                <span className="ml-2 font-medium">
                  {landSizes[formData.landSize as keyof typeof landSizes].name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Tema:</span>
                <span className="ml-2 font-medium">
                  {landThemes[formData.landTheme as keyof typeof landThemes]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">NFT Kapasitesi:</span>
                <span className="ml-2 font-medium">{formData.maxNFTs} adet</span>
              </div>
              <div className="flex items-center">
                <Coins className="w-4 h-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">Maliyet:</span>
                <span className="ml-2 font-medium text-primary">{formData.vrCost} BROS</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">VR Arazi Hakkında</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• VR arazisi onaylanırsa, DAO hazinesinden maliyet düşülecek</li>
              <li>• Tüm DAO üyeleri bu arazide NFT sergileyebilir</li>
              <li>• 3D galeri deneyimi web tarayıcısında çalışır</li>
              <li>• Arazi kullanımı tamamen ücretsizdir</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.description}
              className="flex-1"
            >
              {loading ? 'Oluşturuluyor...' : 'Öneriyi Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};