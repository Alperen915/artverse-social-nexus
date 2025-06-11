
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CommunityTabs } from '@/components/community/CommunityTabs';
import { CommunityJoinPrompt } from '@/components/community/CommunityJoinPrompt';
import { CommunityLoading } from '@/components/community/CommunityLoading';
import { CommunityNotFound } from '@/components/community/CommunityNotFound';
import { useCommunity } from '@/hooks/useCommunity';

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { community, loading, isMember, joinCommunity } = useCommunity(id);

  if (loading) {
    return <CommunityLoading />;
  }

  if (!community) {
    return <CommunityNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <CommunityHeader
          community={community}
          isMember={isMember}
          onJoin={joinCommunity}
          onBack={() => window.history.back()}
        />

        {isMember ? (
          <CommunityTabs communityId={community.id} />
        ) : (
          <CommunityJoinPrompt onJoin={joinCommunity} />
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
