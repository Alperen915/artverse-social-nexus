import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Html, Environment, PerspectiveCamera, TransformControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  Building,
  Copy,
  Maximize
} from 'lucide-react';
import * as THREE from 'three';

interface LandObject {
  id: string;
  type: 'building' | 'decoration' | 'nft_display' | 'portal' | 'tree' | 'sculpture' | 'fountain' | 'light' | 'platform' | 'road' | 'wall' | 'garden';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
  material?: 'standard' | 'metallic' | 'glass' | 'neon';
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
      case 'tree':
        return (
          <group>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <coneGeometry args={[1, 2, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      case 'sculpture':
        return <octahedronGeometry args={[1, 0]} />;
      case 'fountain':
        return (
          <group>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.5, 16]} />
              <meshStandardMaterial color="#4682B4" />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#87CEEB" />
            </mesh>
          </group>
        );
      case 'light':
        return (
          <group>
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
              <meshStandardMaterial color="#2F4F4F" />
            </mesh>
            <mesh position={[0, 3.5, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>
          </group>
        );
      case 'platform':
        return <cylinderGeometry args={[2, 2, 0.3, 16]} />;
      case 'road':
        return <boxGeometry args={[10, 0.1, 2]} />;
      case 'wall':
        return <boxGeometry args={[4, 2, 0.3]} />;
      case 'garden':
        return (
          <group>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[3, 0.2, 3]} />
              <meshStandardMaterial color="#9ACD32" />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#FF1493" />
            </mesh>
          </group>
        );
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getMaterial = () => {
    const baseColor = isSelected ? '#8B5CF6' : hovered ? '#A78BFA' : object.color;
    
    switch (object.material) {
      case 'metallic':
        return (
          <meshStandardMaterial 
            color={baseColor}
            metalness={0.9}
            roughness={0.1}
            opacity={object.type === 'portal' ? 0.7 : 1}
            transparent={object.type === 'portal'}
          />
        );
      case 'glass':
        return (
          <meshPhysicalMaterial 
            color={baseColor}
            metalness={0.1}
            roughness={0.1}
            transmission={0.9}
            thickness={0.5}
            opacity={0.3}
            transparent
          />
        );
      case 'neon':
        return (
          <meshStandardMaterial 
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={1.5}
            opacity={object.type === 'portal' ? 0.7 : 1}
            transparent={object.type === 'portal'}
          />
        );
      default:
        return (
          <meshStandardMaterial 
            color={baseColor}
            opacity={object.type === 'portal' ? 0.7 : 1}
            transparent={object.type === 'portal'}
          />
        );
    }
  };

  // Complex geometries are returned as groups, simple ones as single mesh
  if (['tree', 'fountain', 'light', 'garden'].includes(object.type)) {
    return (
      <group
        ref={meshRef as any}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        
        {/* Object Label */}
        <Html position={[0, 3, 0]} center>
          <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs border pointer-events-none">
            {object.name}
          </div>
        </Html>
      </group>
    );
  }

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
      {getMaterial()}
      
      {/* Object Label */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs border pointer-events-none">
          {object.name}
        </div>
      </Html>
      
      {/* Light glow effect */}
      {object.type === 'light' && (
        <pointLight position={[0, 3.5, 0]} intensity={2} distance={10} color="#FFD700" />
      )}
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

// 3D Scene Component with Transform Controls
function MetaverseScene({ 
  land, 
  selectedObject, 
  onObjectClick,
  onObjectUpdate,
  editMode,
  transformMode
}: { 
  land: MetaverseLand;
  selectedObject: LandObject | null;
  onObjectClick: (object: LandObject) => void;
  onObjectUpdate: (object: LandObject) => void;
  editMode: boolean;
  transformMode: 'translate' | 'rotate' | 'scale';
}) {
  const orbitControlsRef = useRef<any>(null);
  const transformControlsRef = useRef<any>(null);

  useEffect(() => {
    if (transformControlsRef.current) {
      const controls = transformControlsRef.current;
      const callback = () => {
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !controls.dragging;
        }
      };
      controls.addEventListener('dragging-changed', callback);
      return () => controls.removeEventListener('dragging-changed', callback);
    }
  }, []);

  const handleTransformChange = () => {
    if (!selectedObject || !transformControlsRef.current) return;
    
    const object = transformControlsRef.current.object;
    if (object) {
      const updatedObject: LandObject = {
        ...selectedObject,
        position: [object.position.x, object.position.y, object.position.z],
        rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
        scale: [object.scale.x, object.scale.y, object.scale.z]
      };
      onObjectUpdate(updatedObject);
    }
  };

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

      {/* Transform Controls */}
      {editMode && selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={land.objects.find(obj => obj.id === selectedObject.id) as any}
          mode={transformMode}
          onObjectChange={handleTransformChange}
        />
      )}

      <OrbitControls
        ref={orbitControlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export const MetaverseBuilder = () => {
  const [lands, setLands] = useState<MetaverseLand[]>([]);
  const [selectedLand, setSelectedLand] = useState<MetaverseLand | null>(null);
  const [selectedObject, setSelectedObject] = useState<LandObject | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

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

  const objectCategories = {
    structures: [
      { type: 'building', name: 'Building', icon: Building, color: '#374151' },
      { type: 'platform', name: 'Platform', icon: Layers3, color: '#6B7280' },
      { type: 'wall', name: 'Wall', icon: Boxes, color: '#9CA3AF' },
      { type: 'road', name: 'Road', icon: MapPin, color: '#4B5563' },
    ],
    nature: [
      { type: 'tree', name: 'Tree', icon: Layers3, color: '#228B22' },
      { type: 'garden', name: 'Garden', icon: Palette, color: '#9ACD32' },
      { type: 'fountain', name: 'Fountain', icon: RotateCw, color: '#4682B4' },
    ],
    interactive: [
      { type: 'nft_display', name: 'NFT Display', icon: MapPin, color: '#8B5CF6' },
      { type: 'portal', name: 'Portal', icon: RotateCw, color: '#F59E0B' },
      { type: 'light', name: 'Light Post', icon: Plus, color: '#FFD700' },
    ],
    art: [
      { type: 'decoration', name: 'Cone', icon: Layers3, color: '#10B981' },
      { type: 'sculpture', name: 'Sculpture', icon: Boxes, color: '#E11D48' },
    ]
  };

  const allObjectTypes = [
    ...objectCategories.structures,
    ...objectCategories.nature,
    ...objectCategories.interactive,
    ...objectCategories.art
  ];

  const materials = [
    { value: 'standard', name: 'Standard', description: 'Default material' },
    { value: 'metallic', name: 'Metallic', description: 'Shiny metal look' },
    { value: 'glass', name: 'Glass', description: 'Transparent glass' },
    { value: 'neon', name: 'Neon', description: 'Glowing neon effect' },
  ];

  // Load lands from localStorage
  useEffect(() => {
    const savedLands = localStorage.getItem('metaverse-lands');
    if (savedLands) {
      const parsedLands = JSON.parse(savedLands);
      setLands(parsedLands);
      if (parsedLands.length > 0) {
        setSelectedLand(parsedLands[0]);
      }
    } else {
      // Create sample land if none exists
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
      localStorage.setItem('metaverse-lands', JSON.stringify([sampleLand]));
    }
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

    const objType = allObjectTypes.find(t => t.type === type);
    const newObject: LandObject = {
      id: Date.now().toString(),
      type: type as LandObject['type'],
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: objType?.color || '#374151',
      name: `${objType?.name || 'Object'} ${selectedLand.objects.length + 1}`,
      material: 'standard'
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

    setSelectedObject(newObject);
    setEditMode(true);

    toast({
      title: "Object Added",
      description: `${newObject.name} has been added to your land.`
    });
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

  const updateObjectProperty = (property: keyof LandObject, value: any) => {
    if (!selectedObject || !selectedLand) return;

    const updatedObject = { ...selectedObject, [property]: value };
    setSelectedObject(updatedObject);

    const updatedLand = {
      ...selectedLand,
      objects: selectedLand.objects.map(obj => 
        obj.id === selectedObject.id ? updatedObject : obj
      )
    };

    setSelectedLand(updatedLand);
    setLands(prev => prev.map(land => 
      land.id === selectedLand.id ? updatedLand : land
    ));
  };

  const duplicateObject = () => {
    if (!selectedObject || !selectedLand) return;

    const newObject: LandObject = {
      ...selectedObject,
      id: Date.now().toString(),
      name: `${selectedObject.name} (Copy)`,
      position: [
        selectedObject.position[0] + 2,
        selectedObject.position[1],
        selectedObject.position[2] + 2
      ]
    };

    const updatedLand = {
      ...selectedLand,
      objects: [...selectedLand.objects, newObject]
    };

    setSelectedLand(updatedLand);
    setLands(prev => prev.map(land => 
      land.id === selectedLand.id ? updatedLand : land
    ));

    toast({
      title: "Object Duplicated",
      description: `${selectedObject.name} has been duplicated.`
    });
  };

  const saveLand = () => {
    localStorage.setItem('metaverse-lands', JSON.stringify(lands));
    toast({
      title: "Land Saved",
      description: "Your metaverse land has been saved to browser storage!"
    });
  };

  const handleObjectUpdate = (updatedObject: LandObject) => {
    if (!selectedLand) return;

    const updatedLand = {
      ...selectedLand,
      objects: selectedLand.objects.map(obj => 
        obj.id === updatedObject.id ? updatedObject : obj
      )
    };

    setSelectedLand(updatedLand);
    setLands(prev => prev.map(land => 
      land.id === selectedLand.id ? updatedLand : land
    ));
    setSelectedObject(updatedObject);
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
                      onObjectUpdate={handleObjectUpdate}
                      editMode={editMode}
                      transformMode={transformMode}
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
              <CardContent>
                <Tabs defaultValue="structures" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-3">
                    <TabsTrigger value="structures" className="text-xs">Structures</TabsTrigger>
                    <TabsTrigger value="nature" className="text-xs">Nature</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 mb-3">
                    <TabsTrigger value="interactive" className="text-xs">Interactive</TabsTrigger>
                    <TabsTrigger value="art" className="text-xs">Art</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(objectCategories).map(([category, items]) => (
                    <TabsContent key={category} value={category} className="space-y-2 mt-0">
                      {items.map((objType) => (
                        <Button
                          key={objType.type}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={() => addObject(objType.type)}
                        >
                          <objType.icon className="w-3 h-3 mr-2" />
                          <span className="text-xs">{objType.name}</span>
                        </Button>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Selected Object Properties */}
          {selectedObject && editMode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Move className="w-4 h-4" />
                  Object Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input 
                    value={selectedObject.name}
                    className="h-8 text-sm"
                    onChange={(e) => updateObjectProperty('name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Type</Label>
                  <Badge variant="outline" className="text-xs">{selectedObject.type}</Badge>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Transform Mode</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={transformMode === 'translate' ? 'default' : 'outline'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => setTransformMode('translate')}
                    >
                      <Move className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={transformMode === 'rotate' ? 'default' : 'outline'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => setTransformMode('rotate')}
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={transformMode === 'scale' ? 'default' : 'outline'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => setTransformMode('scale')}
                    >
                      <Maximize className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Material</Label>
                  <Select 
                    value={selectedObject.material || 'standard'} 
                    onValueChange={(value: any) => updateObjectProperty('material', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((mat) => (
                        <SelectItem key={mat.value} value={mat.value} className="text-xs">
                          <div>
                            <div className="font-medium">{mat.name}</div>
                            <div className="text-xs text-muted-foreground">{mat.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedObject.color}
                      onChange={(e) => updateObjectProperty('color', e.target.value)}
                      className="h-8 w-16 p-1"
                    />
                    <Input
                      value={selectedObject.color}
                      onChange={(e) => updateObjectProperty('color', e.target.value)}
                      className="h-8 flex-1 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label className="text-xs mb-1">Position</Label>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-4">X:</span>
                        <Slider
                          value={[selectedObject.position[0]]}
                          onValueChange={([x]) => updateObjectProperty('position', [x, selectedObject.position[1], selectedObject.position[2]])}
                          min={-25}
                          max={25}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{selectedObject.position[0].toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-4">Y:</span>
                        <Slider
                          value={[selectedObject.position[1]]}
                          onValueChange={([y]) => updateObjectProperty('position', [selectedObject.position[0], y, selectedObject.position[2]])}
                          min={0}
                          max={10}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{selectedObject.position[1].toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-4">Z:</span>
                        <Slider
                          value={[selectedObject.position[2]]}
                          onValueChange={([z]) => updateObjectProperty('position', [selectedObject.position[0], selectedObject.position[1], z])}
                          min={-25}
                          max={25}
                          step={0.5}
                          className="flex-1"
                        />
                        <span className="text-xs w-8 text-right">{selectedObject.position[2].toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1">Scale</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedObject.scale[0]]}
                        onValueChange={([s]) => updateObjectProperty('scale', [s, s, s])}
                        min={0.5}
                        max={3}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-right">{selectedObject.scale[0].toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={duplicateObject}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={deleteObject}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
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