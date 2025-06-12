
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateEventModal } from './CreateEventModal';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';

interface EventsSectionProps {
  communityId: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue_or_link: string;
  max_attendees: number;
  status: string;
  created_at: string;
  event_rsvps: { count: number }[];
}

export const EventsSection = ({ communityId }: EventsSectionProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_rsvps(count)
        `)
        .eq('community_id', communityId)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
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
  }, [communityId]);

  const handleCreateEvent = () => {
    if (!user) {
      alert('Etkinlik oluşturmak için giriş yapmalısınız');
      return;
    }
    setShowCreateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Yaklaşan';
      case 'ongoing':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Etkinlikler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Topluluk Etkinlikleri</h2>
        </div>
        <Button
          onClick={handleCreateEvent}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Etkinlik Oluştur
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Henüz etkinlik yok
          </h3>
          <p className="text-gray-600 mb-4">
            Topluluk için ilk etkinliği oluşturun!
          </p>
          <Button
            onClick={handleCreateEvent}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Etkinlik Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.event_date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  {event.venue_or_link && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{event.venue_or_link}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {event.event_rsvps?.[0]?.count || 0}
                      {event.max_attendees ? `/${event.max_attendees}` : ''} Katılımcı
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        communityId={communityId}
        onEventCreated={fetchEvents}
      />
    </div>
  );
};
