import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetaverseBuilder } from './MetaverseBuilder';
import { VRGalleryViewer } from '../vr/VRGalleryViewer';
import { 
  Boxes, 
  Map, 
  Users, 
  Coins,
  TrendingUp,
  Eye,
  Building2,
  Sparkles
} from 'lucide-react';

interface MetaverseStats {
  totalLands: number;
  activeUsers: number;
  totalValue: number;
  monthlyGrowth: number;
}

interface LandPreview {
  id: string;
  name: string;
  owner: string;
  size: string;
  visitors: number;
  value: number;
  image: string;
  type: 'public' | 'private' | 'dao';
}

export const MetaverseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const stats: MetaverseStats = {
    totalLands: 1247,
    activeUsers: 3891,
    totalValue: 158000,
    monthlyGrowth: 23.4
  };

  const featuredLands: LandPreview[] = [
    {
      id: '1',
      name: 'Art District Central',
      owner: 'ArtDAO',
      size: '100x100',
      visitors: 2341,
      value: 5000,
      image: '/placeholder.svg',
      type: 'dao'
    },
    {
      id: '2',
      name: 'Cyber Gallery',
      owner: 'CyberCollective',
      size: '50x50',
      visitors: 891,
      value: 2500,
      image: '/placeholder.svg',
      type: 'public'
    },
    {
      id: '3',
      name: 'Nature Sanctuary',
      owner: 'EcoNFT',
      size: '75x75',
      visitors: 1567,
      value: 3200,
      image: '/placeholder.svg',
      type: 'dao'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Metaverse Dashboard</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Explore
          </Button>
          <Button>
            <Building2 className="w-4 h-4 mr-2" />
            Create Land
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="gallery">VR Gallery</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lands</CardTitle>
                <Boxes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLands.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} BROS</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.monthlyGrowth}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
                <p className="text-xs text-muted-foreground">
                  Visitor increase
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Lands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Featured Metaverse Lands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredLands.map((land) => (
                  <Card key={land.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{land.name}</h4>
                          <Badge variant={land.type === 'dao' ? 'default' : 'outline'}>
                            {land.type.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Owner: {land.owner}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Size: {land.size}</span>
                          <span className="text-muted-foreground">{land.visitors} visitors</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-primary">
                            {land.value.toLocaleString()} BROS
                          </span>
                          <Button size="sm" variant="outline">
                            Visit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('builder')}
                >
                  <Building2 className="w-6 h-6 mb-2" />
                  Create New Land
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('gallery')}
                >
                  <Eye className="w-6 h-6 mb-2" />
                  Browse VR Galleries
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('marketplace')}
                >
                  <Coins className="w-6 h-6 mb-2" />
                  Land Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <MetaverseBuilder />
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>VR Gallery Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Experience NFT galleries in virtual reality. Select a gallery to enter the VR experience.
              </p>
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  VR Gallery integration will be connected to your DAO galleries
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Metaverse Land Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Coins className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Land Marketplace</h3>
                <p className="text-muted-foreground mb-6">
                  Buy, sell, and trade metaverse lands with other users
                </p>
                <Button>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};