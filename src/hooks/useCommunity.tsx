
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Community {
  id: string;
  name: string;
  description: string | null;
  genesis_nft_contract: string | null;
  token_gate_contract: string | null;
  token_gate_threshold: number | null;
  cover_image: string | null;
  created_at: string;
  member_count?: number;
}

export const useCommunity = (communityId: string | undefined) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const { user } = useAuth();

  const fetchCommunity = async () => {
    if (!communityId) return;

    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_memberships(count)
        `)
        .eq('id', communityId)
        .single();

      if (error) {
        console.error('Error fetching community:', error);
      } else {
        setCommunity({
          ...data,
          member_count: data.community_memberships?.[0]?.count || 0
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!communityId || !user) return;

    try {
      const { data, error } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsMember(true);
      }
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const joinCommunity = async () => {
    if (!user || !communityId) {
      alert('Please sign in to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        console.error('Error joining community:', error);
        if (error.code === '23505') {
          alert('You are already a member of this community');
        }
      } else {
        alert('Successfully joined the community!');
        setIsMember(true);
        fetchCommunity();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      checkMembership();
    }
  }, [communityId, user]);

  return {
    community,
    loading,
    isMember,
    joinCommunity,
    fetchCommunity
  };
};
