import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollaborativeNFTManager } from '@/components/collaboration/CollaborativeNFTManager';
import { ProjectKanban } from '@/components/collaboration/ProjectKanban';
import { ResourceLibrary } from '@/components/collaboration/ResourceLibrary';

export default function Collaboration() {
  const { id } = useParams<{ id: string }>();
  const communityId = id || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Collaboration Hub</h1>
          <p className="text-muted-foreground">
            Work together on NFTs, manage projects, and share resources
          </p>
        </div>

        <Tabs defaultValue="nfts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nfts">Collaborative NFTs</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="nfts">
            <CollaborativeNFTManager communityId={communityId} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectKanban communityId={communityId} />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceLibrary communityId={communityId} />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
