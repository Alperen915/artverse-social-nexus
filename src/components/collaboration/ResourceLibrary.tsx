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
import { Upload, Download, FileText, Image as ImageIcon, File } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  is_public: boolean;
  download_count: number;
  uploaded_at: string;
  profiles?: {
    username: string;
  };
}

export function ResourceLibrary({ communityId }: { communityId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: 'reference',
    is_public: false
  });

  useEffect(() => {
    fetchResources();
  }, [communityId]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_resources')
        .select('*')
        .eq('community_id', communityId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadResource = async () => {
    if (!user || !selectedFile) return;

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('shared-resources')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('shared_resources')
        .insert({
          community_id: communityId,
          uploader_id: user.id,
          title: newResource.title || selectedFile.name,
          description: newResource.description,
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          category: newResource.category,
          is_public: newResource.is_public
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Resource uploaded successfully'
      });

      setUploadModalOpen(false);
      setSelectedFile(null);
      setNewResource({ title: '', description: '', category: 'reference', is_public: false });
      fetchResources();
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resource',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadResource = async (resource: Resource) => {
    try {
      const { data, error } = await supabase.storage
        .from('shared-resources')
        .download(resource.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await supabase
        .from('shared_resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);

      fetchResources();
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to download resource',
        variant: 'destructive'
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resource Library</h2>
          <p className="text-muted-foreground">Share files and materials with your community</p>
        </div>
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <Input type="file" onChange={handleFileSelect} />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Resource title (optional)"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Describe this resource"
                  rows={3}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newResource.category} onValueChange={(value) => setNewResource({ ...newResource, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={uploadResource} disabled={!selectedFile || uploading} className="w-full">
                {uploading ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(resource.file_type)}
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      by {resource.profiles?.username || 'Unknown'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{resource.category}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatFileSize(resource.file_size)}</span>
                  <span>{resource.download_count} downloads</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => downloadResource(resource)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {resources.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resources yet</p>
            <p className="text-sm text-muted-foreground">Upload your first resource to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
