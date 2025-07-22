
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

interface EditForm {
  username: string;
  display_name: string;
  bio: string;
}

export const useProfileData = (profileId: string | undefined, userId: string | undefined) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    communitiesJoined: 0,
    galleriesParticipated: 0,
    proposalsCreated: 0,
    eventsAttended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<EditForm>({
    username: '',
    display_name: '',
    bio: '',
  });

  const fetchProfile = async () => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error is expected for new users
          console.error('Error fetching profile:', error);
        }
        setProfile(null);
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
      setProfile(null);
    }
  };

  const fetchUserStats = async () => {
    if (!profileId) return;

    try {
      // Fetch communities count
      const communitiesResponse = await supabase
        .from('community_memberships')
        .select('id')
        .eq('user_id', profileId);

      // Fetch galleries count
      const galleriesResponse = await supabase
        .from('gallery_submissions')
        .select('id')
        .eq('submitter_id', profileId);

      // Fetch proposals count
      const proposalsResponse = await supabase
        .from('proposals')
        .select('id')
        .eq('creator_id', profileId);

      // Fetch events count
      const eventsResponse = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('user_id', profileId);

      setStats({
        communitiesJoined: communitiesResponse.data?.length || 0,
        galleriesParticipated: galleriesResponse.data?.length || 0,
        proposalsCreated: proposalsResponse.data?.length || 0,
        eventsAttended: eventsResponse.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
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
        return false;
      } else {
        toast({
          title: "Başarılı",
          description: "Profiliniz güncellendi.",
        });
        fetchProfile();
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const updateEditForm = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchUserStats();
    }
  }, [profileId]);

  return {
    profile,
    stats,
    loading,
    editForm,
    updateEditForm,
    handleSaveProfile,
  };
};
