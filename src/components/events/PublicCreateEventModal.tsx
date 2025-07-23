import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Community {
  id: string;
  name: string;
}

interface PublicCreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

export const PublicCreateEventModal = ({ isOpen, onClose, onEventCreated }: PublicCreateEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    venueOrLink: '',
    maxAttendees: '',
    communityId: '',
  });
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const { user } = useAuth();

  // Fetch user's communities when modal opens
  const fetchUserCommunities = async () => {
    if (!user) return;
    
    setLoadingCommunities(true);
    try {
      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          communities (
            id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching communities:', error);
      } else {
        const userCommunities = data?.map(item => item.communities).filter(Boolean) as Community[];
        setCommunities(userCommunities || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  // Fetch communities when modal opens
  useState(() => {
    if (isOpen && user) {
      fetchUserCommunities();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.communityId) return;

    setLoading(true);
    try {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          event_date: eventDateTime.toISOString(),
          venue_or_link: formData.venueOrLink,
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          community_id: formData.communityId,
          host_id: user.id,
          status: 'upcoming',
        });

      if (error) {
        console.error('Error creating event:', error);
        alert('Etkinlik oluşturulurken hata oluştu');
      } else {
        alert('Etkinlik başarıyla oluşturuldu! Topluluk üyeleri oylamayla katılabilir.');
        onClose();
        setFormData({
          title: '',
          description: '',
          eventDate: '',
          eventTime: '',
          venueOrLink: '',
          maxAttendees: '',
          communityId: '',
        });
        if (onEventCreated) {
          onEventCreated();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Etkinlik oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Herkese Açık Etkinlik Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="community">Topluluk Seçin</Label>
            <Select 
              value={formData.communityId} 
              onValueChange={(value) => setFormData({ ...formData, communityId: value })}
              disabled={loadingCommunities}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCommunities ? "Yükleniyor..." : "Topluluk seçin"} />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {communities.length === 0 && !loadingCommunities && (
              <p className="text-sm text-gray-500 mt-1">
                Etkinlik oluşturmak için bir topluluğa üye olmalısınız.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Etkinlik Başlığı</Label>
            <Input
              id="title"
              placeholder="Etkinlik başlığını girin"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Etkinlik açıklamasını girin"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventDate">Tarih</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="eventTime">Saat</Label>
              <Input
                id="eventTime"
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="venueOrLink">Mekan veya Link</Label>
            <Input
              id="venueOrLink"
              placeholder="Etkinlik mekanı veya çevrimiçi link"
              value={formData.venueOrLink}
              onChange={(e) => setFormData({ ...formData, venueOrLink: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="maxAttendees">Maksimum Katılımcı (Opsiyonel)</Label>
            <Input
              id="maxAttendees"
              type="number"
              min="1"
              placeholder="Katılımcı limiti"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Not:</strong> Bu etkinlik herkese açık olacak ancak topluluklar sadece oylama ile katılabilir.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description || !formData.eventDate || !formData.eventTime || !formData.communityId}
            className="w-full"
          >
            {loading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};