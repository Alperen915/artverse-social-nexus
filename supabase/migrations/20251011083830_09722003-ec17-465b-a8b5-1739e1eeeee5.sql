-- Collaborative NFTs
CREATE TABLE public.collaborative_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  total_shares NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'minted', 'cancelled')),
  nft_contract TEXT,
  token_id TEXT,
  mint_transaction_hash TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.nft_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborative_nft_id UUID REFERENCES public.collaborative_nfts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('artist', 'designer', 'writer', 'musician', 'other')),
  share_percentage NUMERIC NOT NULL CHECK (share_percentage >= 0 AND share_percentage <= 100),
  contribution_description TEXT,
  wallet_address TEXT,
  approved BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Management (Kanban)
CREATE TABLE public.community_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT CHECK (project_type IN ('nft_collection', 'event', 'gallery', 'collaborative', 'other')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.community_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Sharing
CREATE TABLE public.shared_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  category TEXT CHECK (category IN ('reference', 'template', 'asset', 'documentation', 'other')),
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_collaborative_nfts_community ON public.collaborative_nfts(community_id);
CREATE INDEX idx_collaborative_nfts_status ON public.collaborative_nfts(status);
CREATE INDEX idx_nft_collaborators_nft ON public.nft_collaborators(collaborative_nft_id);
CREATE INDEX idx_community_projects_community ON public.community_projects(community_id);
CREATE INDEX idx_community_projects_status ON public.community_projects(status);
CREATE INDEX idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX idx_shared_resources_community ON public.shared_resources(community_id);

-- Enable RLS
ALTER TABLE public.collaborative_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Collaborative NFTs
CREATE POLICY "Community members can view collaborative NFTs" ON public.collaborative_nfts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = collaborative_nfts.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Community members can create collaborative NFTs" ON public.collaborative_nfts FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = collaborative_nfts.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Creators can update their collaborative NFTs" ON public.collaborative_nfts FOR UPDATE USING (
  auth.uid() = created_by
);

-- RLS Policies for NFT Collaborators
CREATE POLICY "Community members can view collaborators" ON public.nft_collaborators FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaborative_nfts cn
    JOIN public.community_memberships cm ON cm.community_id = cn.community_id
    WHERE cn.id = nft_collaborators.collaborative_nft_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "NFT creators can add collaborators" ON public.nft_collaborators FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collaborative_nfts 
    WHERE id = nft_collaborators.collaborative_nft_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Collaborators can update their own records" ON public.nft_collaborators FOR UPDATE USING (
  auth.uid() = user_id
);

-- RLS Policies for Community Projects
CREATE POLICY "Community members can view projects" ON public.community_projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = community_projects.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Community members can create projects" ON public.community_projects FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = community_projects.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Project creators can update projects" ON public.community_projects FOR UPDATE USING (
  auth.uid() = created_by
);

-- RLS Policies for Project Tasks
CREATE POLICY "Project members can view tasks" ON public.project_tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.community_projects cp
    JOIN public.community_memberships cm ON cm.community_id = cp.community_id
    WHERE cp.id = project_tasks.project_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can create tasks" ON public.project_tasks FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.community_projects cp
    JOIN public.community_memberships cm ON cm.community_id = cp.community_id
    WHERE cp.id = project_tasks.project_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Assigned users and creators can update tasks" ON public.project_tasks FOR UPDATE USING (
  auth.uid() = assigned_to OR auth.uid() = created_by
);

-- RLS Policies for Shared Resources
CREATE POLICY "Community members can view resources" ON public.shared_resources FOR SELECT USING (
  is_public = true OR
  EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = shared_resources.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Community members can upload resources" ON public.shared_resources FOR INSERT WITH CHECK (
  auth.uid() = uploader_id AND
  EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_id = shared_resources.community_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Uploaders can update their resources" ON public.shared_resources FOR UPDATE USING (
  auth.uid() = uploader_id
);

CREATE POLICY "Uploaders can delete their resources" ON public.shared_resources FOR DELETE USING (
  auth.uid() = uploader_id
);

-- Create storage bucket for shared resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shared-resources', 'shared-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for shared resources
CREATE POLICY "Community members can view shared resources" ON storage.objects FOR SELECT USING (
  bucket_id = 'shared-resources' AND
  EXISTS (
    SELECT 1 FROM public.shared_resources sr
    JOIN public.community_memberships cm ON cm.community_id = sr.community_id
    WHERE sr.file_path = storage.objects.name
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can upload resources" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'shared-resources' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own resources" ON storage.objects FOR UPDATE USING (
  bucket_id = 'shared-resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own resources" ON storage.objects FOR DELETE USING (
  bucket_id = 'shared-resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);