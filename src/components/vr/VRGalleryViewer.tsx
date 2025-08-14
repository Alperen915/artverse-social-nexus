import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment, PerspectiveCamera } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Headset, Eye, RotateCcw, ZoomIn } from 'lucide-react';
import * as THREE from 'three';

interface VRGalleryViewerProps {
  galleryId: string;
  galleryTitle: string;
}

interface NFTSubmission {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  submitter_id: string;
}

// NFT Frame Component
function NFTFrame({ position, submission, onClick }: { 
  position: [number, number, number]; 
  submission: NFTSubmission;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Frame */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[2.2, 2.8, 0.1]} />
        <meshStandardMaterial color={hovered ? "#8B5CF6" : "#374151"} />
      </mesh>
      
      {/* Image Plane */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2, 2.5]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* NFT Info */}
      <Html
        transform
        occlude
        position={[0, -1.8, 0.1]}
        style={{
          width: '200px',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 border">
          <h4 className="text-sm font-semibold text-foreground truncate">{submission.title}</h4>
          <p className="text-xs text-muted-foreground">{submission.price} BROS</p>
        </div>
      </Html>
      
      {hovered && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.3}
          color="#8B5CF6"
          anchorX="center"
          anchorY="middle"
        >
          Click to view details
        </Text>
      )}
    </group>
  );
}

// Gallery Environment Component
function GalleryEnvironment({ submissions, onNFTClick }: { 
  submissions: NFTSubmission[];
  onNFTClick: (submission: NFTSubmission) => void;
}) {
  // Calculate positions for NFTs in a circular arrangement
  const radius = 8;
  const angleStep = (Math.PI * 2) / Math.max(submissions.length, 1);
  
  return (
    <>
      {/* Gallery Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <circleGeometry args={[15]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      
      {/* Gallery Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <circleGeometry args={[15]} />
        <meshStandardMaterial color="#374151" opacity={0.8} transparent />
      </mesh>
      
      {/* Gallery Walls (Transparent) */}
      <mesh>
        <cylinderGeometry args={[15, 15, 11, 16, 1, true]} />
        <meshStandardMaterial color="#4B5563" opacity={0.3} transparent side={THREE.DoubleSide} />
      </mesh>
      
      {/* Central Pillar */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
      
      {/* Central Title */}
      <Text
        position={[0, 6, 0]}
        fontSize={1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        VR Gallery
      </Text>
      
      {/* NFT Displays */}
      {submissions.map((submission, index) => {
        const angle = index * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <NFTFrame
            key={submission.id}
            position={[x, 0, z]}
            submission={submission}
            onClick={() => onNFTClick(submission)}
          />
        );
      })}
      
      {/* Ambient Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
    </>
  );
}

export const VRGalleryViewer = ({ galleryId, galleryTitle }: VRGalleryViewerProps) => {
  const [submissions, setSubmissions] = useState<NFTSubmission[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [vrMode, setVrMode] = useState(false);

  useEffect(() => {
    fetchGallerySubmissions();
  }, [galleryId]);

  const fetchGallerySubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_submissions')
        .select('*')
        .eq('gallery_id', galleryId);

      if (error) {
        console.error('Error fetching gallery submissions:', error);
      } else {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNFTClick = (submission: NFTSubmission) => {
    setSelectedNFT(submission);
  };

  const resetCamera = () => {
    // This will be handled by OrbitControls reset
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading VR Gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headset className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">{galleryTitle} - VR Gallery</h2>
          <Badge variant="secondary">
            {submissions.length} NFTs
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={resetCamera}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset View
          </Button>
          <Button
            onClick={() => setVrMode(!vrMode)}
            variant={vrMode ? "default" : "outline"}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            {vrMode ? "Exit VR" : "VR Mode"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Gallery Viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] w-full relative">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={75} />
                  <Suspense fallback={<Html center>Loading...</Html>}>
                    <Environment preset="studio" />
                    <GalleryEnvironment 
                      submissions={submissions}
                      onNFTClick={handleNFTClick}
                    />
                  </Suspense>
                  <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={20}
                    maxPolarAngle={Math.PI / 2}
                  />
                </Canvas>
                
                {/* VR Instructions */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
                  <p className="text-sm text-muted-foreground">
                    🖱️ Click & drag to look around<br/>
                    🖱️ Scroll to zoom in/out<br/>
                    🎯 Click on NFTs for details
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Details Sidebar */}
        <div className="space-y-4">
          {selectedNFT ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZoomIn className="w-5 h-5" />
                  NFT Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <img 
                    src={selectedNFT.image_url} 
                    alt={selectedNFT.title}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="text-muted-foreground">Image not available</div>';
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{selectedNFT.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedNFT.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {selectedNFT.price} BROS
                  </Badge>
                  <Button size="sm">
                    View in Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Headset className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click on an NFT in the 3D gallery to view details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Gallery Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total NFTs:</span>
                <span className="font-medium">{submissions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Price:</span>
                <span className="font-medium">
                  {submissions.length > 0 
                    ? (submissions.reduce((sum, s) => sum + s.price, 0) / submissions.length).toFixed(0)
                    : '0'
                  } BROS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gallery Type:</span>
                <span className="font-medium">VR Experience</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};