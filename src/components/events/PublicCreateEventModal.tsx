import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PublicCreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export const PublicCreateEventModal = ({ isOpen, onClose, onEventCreated }: PublicCreateEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    venue_or_link: '',
    max_attendees: '',
    ticket_price: '',
    is_paid: false,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      venue_or_link: '',
      max_attendees: '',
      ticket_price: '',
      is_paid: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Hata",
        description: "Etkinlik oluşturmak için giriş yapmalısınız",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.event_date) {
      toast({
        title: "Eksik Bilgi",
        description: "Başlık ve tarih alanları zorunludur",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Ensure the event date is in the future
      const eventDate = new Date(formData.event_date);
      const now = new Date();
      
      if (eventDate <= now) {
        toast({
          title: "Geçersiz Tarih",
          description: "Etkinlik tarihi gelecekte olmalıdır",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('public_events')
        .insert({
          title: formData.title,
          description: formData.description || null,
          event_date: eventDate.toISOString(),
          venue_or_link: formData.venue_or_link || null,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          host_id: user.id,
          is_paid: formData.is_paid,
          ticket_price: formData.is_paid && formData.ticket_price ? parseFloat(formData.ticket_price) : 0,
        });

      if (error) {
        console.error('Error creating public event:', error);
        toast({
          title: "Hata",
          description: "Etkinlik oluşturulurken bir hata oluştu",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Başarılı",
          description: "Herkese açık etkinlik başarıyla oluşturuldu!",
        });
        resetForm();
        onEventCreated();
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Herkese Açık Etkinlik Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Etkinlik Başlığı *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Etkinlik başlığını girin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Etkinlik açıklamasını girin"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_date">Etkinlik Tarihi *</Label>
            <Input
              id="event_date"
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => handleInputChange('event_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_or_link">Mekan veya Link</Label>
            <Input
              id="venue_or_link"
              value={formData.venue_or_link}
              onChange={(e) => handleInputChange('venue_or_link', e.target.value)}
              placeholder="Etkinlik yeri veya online link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_attendees">Maksimum Katılımcı</Label>
            <Input
              id="max_attendees"
              type="number"
              value={formData.max_attendees}
              onChange={(e) => handleInputChange('max_attendees', e.target.value)}
              placeholder="Katılımcı limiti (opsiyonel)"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_paid"
                checked={formData.is_paid}
                onChange={(e) => setFormData(prev => ({ ...prev, is_paid: e.target.checked, ticket_price: e.target.checked ? prev.ticket_price : '' }))}
                className="w-4 h-4"
              />
              <Label htmlFor="is_paid">Ücretli Etkinlik</Label>
            </div>
            {formData.is_paid && (
              <div className="ml-6">
                <Label htmlFor="ticket_price">Bilet Fiyatı (BROS)</Label>
                <Input
                  id="ticket_price"
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                  placeholder="Bilet fiyatını girin"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};