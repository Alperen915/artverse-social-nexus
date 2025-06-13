
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Users, ImageIcon, Calendar, Vote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface UserStats {
  communitiesJoined: number;
  galleriesParticipated: number;
  proposalsCreated: number;
  eventsAttended: number;
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    communitiesJoined: 0,
    galleriesParticipated: 0,
    proposalsCreated: 0,
    eventsAttended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    display_name: '',
    bio: '',
  });

  const isOwnProfile = !id || (user && user.id === id);
  const profileId = id || user?.id;

  const fetchProfile = async () => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        setEditForm({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!profileId) return;

    try {
      // Communities joined - using simpler query approach
      const communitiesQuery = await supabase
        .from('community_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      // Galleries participated
      const galleriesQuery = await supabase
        .from('gallery_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('submitter_id', profileId);

      // Proposals created
      const proposalsQuery = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('proposer_id', profileId);

      // Events attended (RSVP'd)
      const eventsQuery = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId);

      setStats({
        communitiesJoined: communitiesQuery.count || 0,
        galleriesParticipated: galleriesQuery.count || 0,
        proposalsCreated: proposalsQuery.count || 0,
        eventsAttended: eventsQuery.count || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !isOwnProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: editForm.username,
          display_name: editForm.display_name,
          bio: editForm.bio,
        });

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Hata",
          description: "Profil güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Başarılı",
          description: "Profiliniz güncellendi.",
        });
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchUserStats();
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Profil yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Profil bulunamadı.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.display_name || profile.username || 'Anonim Kullanıcı'}
                    </h1>
                    {profile.username && (
                      <p className="text-gray-600">@{profile.username}</p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-700 mt-2">{profile.bio}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Katılım: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                
                {isOwnProfile && (
                  <Button
                    onClick={() => setEditing(!editing)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          {editing && isOwnProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Profili Düzenle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="kullanici_adi"
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Görünen Ad</Label>
                  <Input
                    id="display_name"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    placeholder="Tam Adınız"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Biyografi</Label>
                  <Input
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Kendiniz hakkında kısa bilgi..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Topluluklar</p>
                    <p className="text-2xl font-bold">{stats.communitiesJoined}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Galeri Katılımı</p>
                    <p className="text-2xl font-bold">{stats.galleriesParticipated}</p>
                  </div>
                  <ImageIcon className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Öneriler</p>
                    <p className="text-2xl font-bold">{stats.proposalsCreated}</p>
                  </div>
                  <Vote className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Etkinlikler</p>
                    <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
