import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface GallerySubmissionRequirementProps {
  galleryId: string;
  communityId: string;
}

interface MemberSubmissionStatus {
  user_id: string;
  has_submitted: boolean;
  profiles?: {
    username: string;
    display_name: string;
  } | null;
}

export const GallerySubmissionRequirement = ({ 
  galleryId, 
  communityId 
}: GallerySubmissionRequirementProps) => {
  const [memberStatuses, setMemberStatuses] = useState<MemberSubmissionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMemberSubmissionStatus();
  }, [galleryId, communityId]);

  const fetchMemberSubmissionStatus = async () => {
    try {
      // Get all community members with their profile information
      const { data: members, error: membersError } = await supabase
        .from('community_memberships')
        .select('user_id')
        .eq('community_id', communityId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        setMemberStatuses([]);
        return;
      }

      // Get profile information for all members
      const memberIds = members?.map(m => m.user_id) || [];
      
      if (memberIds.length === 0) {
        setMemberStatuses([]);
        return;
      }
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', memberIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get all submissions for this gallery
      const { data: submissions, error: submissionsError } = await supabase
        .from('gallery_submissions')
        .select('submitter_id')
        .eq('gallery_id', galleryId);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        setMemberStatuses([]);
        return;
      }

      const submitterIds = new Set(submissions?.map(s => s.submitter_id) || []);

      const statuses = members?.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          user_id: member.user_id,
          has_submitted: submitterIds.has(member.user_id),
          profiles: profile ? {
            username: profile.username || '',
            display_name: profile.display_name || ''
          } : null
        };
      }) || [];

      setMemberStatuses(statuses);
    } catch (error) {
      console.error('Error:', error);
      setMemberStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Üye durumları kontrol ediliyor...</p>
      </div>
    );
  }

  const totalMembers = memberStatuses.length;
  const submittedMembers = memberStatuses.filter(m => m.has_submitted).length;
  const pendingMembers = totalMembers - submittedMembers;
  const currentUserStatus = memberStatuses.find(m => m.user_id === user?.id);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Eser Gönderim Durumu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{submittedMembers}</div>
            <div className="text-sm text-green-800">Gönderen Üye</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingMembers}</div>
            <div className="text-sm text-orange-800">Bekleyen Üye</div>
          </div>
        </div>

        {currentUserStatus && !currentUserStatus.has_submitted && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dikkat:</strong> Bu galeye henüz eser göndermediniz. Her üyenin en az bir eser göndermesi zorunludur.
            </AlertDescription>
          </Alert>
        )}

        {currentUserStatus && currentUserStatus.has_submitted && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Eserinizi başarıyla gönderdiniz!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Üye Durumları</h5>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {memberStatuses.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  {member.profiles?.display_name || member.profiles?.username || 'Anonim Üye'}
                </span>
                <Badge variant={member.has_submitted ? "default" : "secondary"}>
                  {member.has_submitted ? "Gönderildi" : "Bekliyor"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
          <p><strong>Önemli:</strong> Tüm üyelerin eser göndermesi gerekiyor. Satışlardan elde edilen gelir, eser gönderen tüm üyeler arasında eşit olarak dağıtılacaktır.</p>
        </div>
      </CardContent>
    </Card>
  );
};
