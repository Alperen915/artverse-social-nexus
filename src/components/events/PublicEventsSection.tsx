import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PublicCreateEventModal } from './PublicCreateEventModal';
import { Plus, Calendar, MapPin, Users, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PublicEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue_or_link: string;
  max_attendees: number;
  status: string;
  created_at: string;
  public_event_rsvps: { count: number }[];
}

export const PublicEventsSection = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rsvpData, setRsvpData] = useState<{ [key: string]: { email: string; name: string } }>({});
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('public_events')
        .select(`
          *,
          public_event_rsvps(count)
        `)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching public events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId: string) => {
    const data = rsvpData[eventId];
    
    if (!data?.email || !data?.name) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen email ve isim bilgilerinizi girin",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('public_event_rsvps')
        .insert({
          event_id: eventId,
          user_id: user?.id || null,
          email: data.email,
          name: data.name
        });

      if (error) {
        console.error('Error RSVPing to event:', error);
        toast({
          title: "Hata",
          description: "RSVP işlemi başarısız oldu",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Başarılı",
          description: "Etkinliğe kaydolunuz!",
        });
        fetchEvents();
        setRsvpData(prev => ({ ...prev, [eventId]: { email: '', name: '' } }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateRsvpData = (eventId: string, field: 'email' | 'name', value: string) => {
    setRsvpData(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Yaklaşan';
      case 'ongoing': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Etkinlikler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Herkese Açık Etkinlikler</h2>
          <p className="text-muted-foreground">Tüm topluluklar için açık etkinliklere katılın</p>
        </div>
        {user && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Etkinlik Oluştur
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz herkese açık etkinlik yok.</p>
            {user && (
              <Button 
                onClick={() => setShowCreateModal(true)} 
                className="mt-4"
              >
                İlk Etkinliği Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.event_date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {event.venue_or_link && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.venue_or_link.startsWith('http') ? 'Online' : event.venue_or_link}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.public_event_rsvps?.[0]?.count || 0} katılımcı</span>
                    {event.max_attendees && (
                      <span>/ {event.max_attendees} maksimum</span>
                    )}
                  </div>
                  
                  {event.status === 'upcoming' && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="İsminiz"
                        value={rsvpData[event.id]?.name || ''}
                        onChange={(e) => updateRsvpData(event.id, 'name', e.target.value)}
                        className="w-32"
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={rsvpData[event.id]?.email || ''}
                        onChange={(e) => updateRsvpData(event.id, 'email', e.target.value)}
                        className="w-40"
                      />
                      <Button 
                        onClick={() => handleRSVP(event.id)}
                        size="sm"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        RSVP
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PublicCreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={fetchEvents}
      />
    </div>
  );
};