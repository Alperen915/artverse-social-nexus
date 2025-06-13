
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { UserStatsComponent } from '@/components/profile/UserStats';
import { useProfileData } from '@/hooks/useProfileData';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const isOwnProfile = !id || (user && user.id === id);
  const profileId = id || user?.id;

  const {
    profile,
    stats,
    loading,
    editForm,
    updateEditForm,
    handleSaveProfile,
  } = useProfileData(profileId, user?.id);

  const handleSave = async () => {
    const success = await handleSaveProfile();
    if (success) {
      setEditing(false);
    }
  };

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
          <ProfileHeader 
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditClick={() => setEditing(!editing)}
          />

          {/* Edit Profile Form */}
          {editing && isOwnProfile && (
            <ProfileEditForm
              editForm={editForm}
              onFormChange={updateEditForm}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          )}

          {/* User Stats */}
          <UserStatsComponent stats={stats} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
