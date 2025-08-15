import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Html, Environment, PerspectiveCamera } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { 
  Boxes, 
  MapPin, 
  Palette, 
  Save, 
  Plus, 
  Trash2, 
  Move,
  RotateCw,
  Layers3,
  Building
} from 'lucide-react';
import * as THREE from 'three';

interface LandObject {
  id: string;
  type: 'building' | 'decoration' | 'nft_display' | 'portal';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
}

interface MetaverseLand {
  id: string;
  name: string;
  description: string;
  size: [number, number];
  theme: string;
  objects: LandObject[];
  createdAt: string;
}

// Object Component
function ObjectComponent({ object, isSelected, onClick }: { 
  object: LandObject; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getGeometry = () => {
    switch (object.type) {
      case 'building':
        return <boxGeometry args={[2, 3, 2]} />;
      case 'decoration':
        return <coneGeometry args={[1, 2, 8]} />;
      case 'nft_display':
        return <boxGeometry args={[2, 2.5, 0.2]} />;
      case 'portal':
        return <torusGeometry args={[1.5, 0.5, 8, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <meshStandardMaterial 
        color={isSelected ? '#8B5CF6' : hovered ? '#A78BFA' : object.color}
        opacity={object.type === 'portal' ? 0.7 : 1}
        transparent={object.type === 'portal'}
      />
      
      {/* Object Label */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs border">
          {object.name}
        </div>
      </Html>
    </mesh>
  );
}

// Ground Grid Component
function GroundGrid({ size }: { size: [number, number] }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={`hsl(var(--muted))`} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={size}
        cellSize={2}
        cellThickness={0.5}
        cellColor="hsl(var(--border))"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="hsl(var(--primary))"
        fadeDistance={100}
        fadeStrength={1}
      />
    </>
  );
}

// 3D Scene Component
function MetaverseScene({ 
  land, 
  selectedObject, 
  onObjectClick 
}: { 
  land: MetaverseLand;
  selectedObject: LandObject | null;
  onObjectClick: (object: LandObject) => void;
}) {
  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground */}
      <GroundGrid size={land.size} />
      
      {/* Land Boundaries */}
      <mesh position={[0, 1, land.size[1] / 2]}>
        <boxGeometry args={[land.size[0], 2, 0.2]} />
        <meshStandardMaterial color="hsl(var(--primary))" opacity={0.5} transparent />
      </mesh>
      <mesh position={[0, 1, -land.size[1] / 2]}>
        <boxGeometry args={[land.size[0], 2, 0.2]} />
        <meshStandardMaterial color="hsl(var(--primary))" opacity={0.5} transparent />
      </mesh>
      <mesh position={[land.size[0] / 2, 1, 0]}>
        <boxGeometry args={[0.2, 2, land.size[1]]} />
        <meshStandardMaterial color="hsl(var(--primary))" opacity={0.5} transparent />
      </mesh>
      <mesh position={[-land.size[0] / 2, 1, 0]}>
        <boxGeometry args={[0.2, 2, land.size[1]]} />
        <meshStandardMaterial color="hsl(var(--primary))" opacity={0.5} transparent />
      </mesh>
      
      {/* Land Title */}
      <Text
        position={[0, 5, 0]}
        fontSize={2}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
      >
        {land.name}
      </Text>
      
      {/* Objects */}
      {land.objects.map((object) => (
        <ObjectComponent
          key={object.id}
          object={object}
          isSelected={selectedObject?.id === object.id}
          onClick={() => onObjectClick(object)}
        />
      ))}
    </>
  );
}

export const MetaverseBuilder = () => {
  const [lands, setLands] = useState<MetaverseLand[]>([]);
  const [selectedLand, setSelectedLand] = useState<MetaverseLand | null>(null);
  const [selectedObject, setSelectedObject] = useState<LandObject | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [newLandData, setNewLandData] = useState({
    name: '',
    description: '',
    size: '50x50' as '25x25' | '50x50' | '100x100',
    theme: 'modern' as 'modern' | 'nature' | 'cyberpunk' | 'classical'
  });

  const landSizes = {
    '25x25': [25, 25] as [number, number],
    '50x50': [50, 50] as [number, number],
    '100x100': [100, 100] as [number, number]
  };

  const themes = {
    modern: { name: 'Modern City', color: '#6B7280' },
    nature: { name: 'Nature Park', color: '#10B981' },
    cyberpunk: { name: 'Cyberpunk', color: '#8B5CF6' },
    classical: { name: 'Classical', color: '#F59E0B' }
  };

  const objectTypes = [
    { type: 'building', name: 'Building', icon: Building, color: '#374151' },
    { type: 'decoration', name: 'Decoration', icon: Layers3, color: '#10B981' },
    { type: 'nft_display', name: 'NFT Display', icon: MapPin, color: '#8B5CF6' },
    { type: 'portal', name: 'Portal', icon: RotateCw, color: '#F59E0B' }
  ];

  // Load sample land
  useEffect(() => {
    const sampleLand: MetaverseLand = {
      id: '1',
      name: 'Demo Land',
      description: 'Sample metaverse land for demonstration',
      size: [50, 50],
      theme: 'modern',
      objects: [
        {
          id: '1',
          type: 'building',
          position: [10, 1.5, 10],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#374151',
          name: 'Main Building'
        },
        {
          id: '2',
          type: 'nft_display',
          position: [-10, 1.25, -10],
          rotation: [0, Math.PI / 4, 0],
          scale: [1, 1, 1],
          color: '#8B5CF6',
          name: 'NFT Gallery'
        }
      ],
      createdAt: new Date().toISOString()
    };
    
    setLands([sampleLand]);
    setSelectedLand(sampleLand);
  }, []);

  const createNewLand = () => {
    const newLand: MetaverseLand = {
      id: Date.now().toString(),
      name: newLandData.name,
      description: newLandData.description,
      size: landSizes[newLandData.size],
      theme: newLandData.theme,
      objects: [],
      createdAt: new Date().toISOString()
    };

    setLands(prev => [...prev, newLand]);
    setSelectedLand(newLand);
    setShowCreateDialog(false);
    
    toast({
      title: "Land Created",
      description: `${newLandData.name} metaverse land created successfully!`
    });
  };

  const addObject = (type: string) => {
    if (!selectedLand) return;

    const newObject: LandObject = {
      id: Date.now().toString(),
      type: type as LandObject['type'],
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: objectTypes.find(t => t.type === type)?.color || '#374151',
      name: `${objectTypes.find(t => t.type === type)?.name} ${selectedLand.objects.length + 1}`
    };

    setSelectedLand(prev => prev ? {
      ...prev,
      objects: [...prev.objects, newObject]
    } : null);

    setLands(prev => prev.map(land => 
      land.id === selectedLand.id 
        ? { ...land, objects: [...land.objects, newObject] }
        : land
    ));
  };

  const deleteObject = () => {
    if (!selectedObject || !selectedLand) return;

    setSelectedLand(prev => prev ? {
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== selectedObject.id)
    } : null);

    setLands(prev => prev.map(land => 
      land.id === selectedLand.id 
        ? { ...land, objects: land.objects.filter(obj => obj.id !== selectedObject.id) }
        : land
    ));

    setSelectedObject(null);
  };

  const saveLand = () => {
    toast({
      title: "Land Saved",
      description: "Your metaverse land has been saved successfully!"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Metaverse Builder</h1>
          <Badge variant="secondary">
            {lands.length} Land{lands.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateDialog(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Land
          </Button>
          {selectedLand && (
            <>
              <Button
                onClick={() => setEditMode(!editMode)}
                variant={editMode ? "default" : "outline"}
              >
                <Move className="w-4 h-4 mr-2" />
                {editMode ? "View Mode" : "Edit Mode"}
              </Button>
              <Button onClick={saveLand}>
                <Save className="w-4 h-4 mr-2" />
                Save Land
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Builder */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {selectedLand ? (
                <div className="h-[700px] w-full relative">
                  <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[30, 20, 30]} fov={60} />
                    <MetaverseScene
                      land={selectedLand}
                      selectedObject={selectedObject}
                      onObjectClick={setSelectedObject}
                    />
                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={10}
                      maxDistance={100}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Canvas>
                  
                  {/* Controls Overlay */}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
                    <p className="text-sm text-muted-foreground">
                      🖱️ Click & drag to rotate<br/>
                      🖱️ Scroll to zoom<br/>
                      {editMode ? "🎯 Click objects to select" : "👁️ View mode active"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[700px] flex items-center justify-center">
                  <div className="text-center">
                    <Boxes className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-xl text-muted-foreground mb-4">No land selected</p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      Create Your First Land
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Land Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Lands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lands.map((land) => (
                <div
                  key={land.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLand?.id === land.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedLand(land)}
                >
                  <h4 className="font-medium">{land.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {land.size[0]}x{land.size[1]} • {themes[land.theme as keyof typeof themes].name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {land.objects.length} objects
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Object Tools */}
          {editMode && selectedLand && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Add Objects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objectTypes.map((objType) => (
                  <Button
                    key={objType.type}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => addObject(objType.type)}
                  >
                    <objType.icon className="w-4 h-4 mr-2" />
                    {objType.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Selected Object Properties */}
          {selectedObject && editMode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="w-5 h-5" />
                  Object Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={selectedObject.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setSelectedObject(prev => prev ? { ...prev, name: newName } : null);
                    }}
                  />
                </div>
                
                <div>
                  <Label>Type</Label>
                  <Badge variant="outline">{selectedObject.type}</Badge>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={deleteObject}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Object
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Land Info */}
          {selectedLand && (
            <Card>
              <CardHeader>
                <CardTitle>Land Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{selectedLand.size[0]}x{selectedLand.size[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme:</span>
                  <span className="font-medium">{themes[selectedLand.theme as keyof typeof themes].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objects:</span>
                  <span className="font-medium">{selectedLand.objects.length}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Land Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Metaverse Land
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="landName">Land Name</Label>
              <Input
                id="landName"
                placeholder="My Metaverse Land"
                value={newLandData.name}
                onChange={(e) => setNewLandData({ ...newLandData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="landDescription">Description</Label>
              <Input
                id="landDescription"
                placeholder="Describe your land..."
                value={newLandData.description}
                onChange={(e) => setNewLandData({ ...newLandData, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Land Size</Label>
              <Select 
                value={newLandData.size} 
                onValueChange={(value: any) => setNewLandData({ ...newLandData, size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25x25">Small (25x25)</SelectItem>
                  <SelectItem value="50x50">Medium (50x50)</SelectItem>
                  <SelectItem value="100x100">Large (100x100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Theme</Label>
              <Select 
                value={newLandData.theme} 
                onValueChange={(value: any) => setNewLandData({ ...newLandData, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(themes).map(([key, theme]) => (
                    <SelectItem key={key} value={key}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={createNewLand}
                disabled={!newLandData.name}
              >
                Create Land
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};