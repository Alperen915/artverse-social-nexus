import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Image } from 'lucide-react';

interface CollaborativeNFT {
  id: string;
  title: string;
  description: string;
  image_url: string;
  status: string;
  total_shares: number;
  created_at: string;
  collaborators: Collaborator[];
}

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  share_percentage: number;
  contribution_description: string;
  approved: boolean;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export function CollaborativeNFTManager({ communityId }: { communityId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<CollaborativeNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newNFT, setNewNFT] = useState({
    title: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCollaborativeNFTs();
  }, [communityId]);

  const fetchCollaborativeNFTs = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborative_nfts')
        .select(`
          *,
          nft_collaborators (
            id,
            user_id,
            role,
            share_percentage,
            contribution_description,
            approved,
            profiles (username, avatar_url)
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedData = (data || []).map((nft: any) => ({
        ...nft,
        collaborators: nft.nft_collaborators || []
      }));
      setNfts(formattedData);
    } catch (error) {
      console.error('Error fetching collaborative NFTs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collaborative NFTs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createCollaborativeNFT = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collaborative_nfts')
        .insert({
          community_id: communityId,
          created_by: user.id,
          ...newNFT
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Collaborative NFT created successfully'
      });

      setCreateModalOpen(false);
      setNewNFT({ title: '', description: '', image_url: '' });
      fetchCollaborativeNFTs();
    } catch (error) {
      console.error('Error creating collaborative NFT:', error);
      toast({
        title: 'Error',
        description: 'Failed to create collaborative NFT',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'minted':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading collaborative NFTs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Collaborative NFTs</h2>
          <p className="text-muted-foreground">Create NFTs together with multiple artists</p>
        </div>
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collaborative NFT
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collaborative NFT</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newNFT.title}
                  onChange={(e) => setNewNFT({ ...newNFT, title: e.target.value })}
                  placeholder="NFT Title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newNFT.description}
                  onChange={(e) => setNewNFT({ ...newNFT, description: e.target.value })}
                  placeholder="Describe the collaborative project"
                  rows={4}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={newNFT.image_url}
                  onChange={(e) => setNewNFT({ ...newNFT, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={createCollaborativeNFT} className="w-full">
                Create NFT
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden">
            {nft.image_url && (
              <div className="aspect-square relative">
                <img
                  src={nft.image_url}
                  alt={nft.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{nft.title}</CardTitle>
                <Badge className={getStatusColor(nft.status)}>
                  {nft.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {nft.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {nft.collaborators?.length || 0} Collaborators
                </div>
                {nft.collaborators && nft.collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {nft.collaborators.slice(0, 3).map((collab) => (
                      <Badge key={collab.id} variant="outline" className="text-xs">
                        {collab.profiles?.username || 'Unknown'} ({collab.share_percentage}%)
                      </Badge>
                    ))}
                    {nft.collaborators.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{nft.collaborators.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nfts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No collaborative NFTs yet</p>
            <p className="text-sm text-muted-foreground">Create your first collaborative project</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
