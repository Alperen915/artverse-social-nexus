
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VotingSection } from '@/components/voting/VotingSection';
import { NFTSalesTracker } from '@/components/revenue/NFTSalesTracker';
import { GalleryManager } from '@/components/gallery/GalleryManager';
import { EventsSection } from '@/components/events/EventsSection';
import { Vote, DollarSign, ImageIcon, Calendar } from 'lucide-react';

interface CommunityTabsProps {
  communityId: string;
}

export const CommunityTabs = ({ communityId }: CommunityTabsProps) => {
  return (
    <Tabs defaultValue="governance" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="governance" className="flex items-center gap-2">
          <Vote className="w-4 h-4" />
          Yönetim
        </TabsTrigger>
        <TabsTrigger value="galleries" className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Galeriler
        </TabsTrigger>
        <TabsTrigger value="events" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Etkinlikler
        </TabsTrigger>
        <TabsTrigger value="revenue" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Gelir
        </TabsTrigger>
        <TabsTrigger value="legacy-gallery" className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Legacy
        </TabsTrigger>
      </TabsList>

      <TabsContent value="governance">
        <VotingSection communityId={communityId} />
      </TabsContent>

      <TabsContent value="galleries">
        <GalleryManager communityId={communityId} />
      </TabsContent>

      <TabsContent value="events">
        <EventsSection communityId={communityId} />
      </TabsContent>

      <TabsContent value="revenue">
        <NFTSalesTracker communityId={communityId} />
      </TabsContent>

      <TabsContent value="legacy-gallery">
        <Card>
          <CardHeader>
            <CardTitle>Community Gallery (Legacy)</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Legacy gallery feature!</p>
            <p className="text-sm text-gray-500 mt-2">
              This was the old gallery. Use the new "Galleries" tab for community-driven NFT galleries.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
