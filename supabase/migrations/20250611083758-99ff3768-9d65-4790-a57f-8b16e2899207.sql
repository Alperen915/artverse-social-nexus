
-- Create table for NFT galleries
CREATE TABLE public.nft_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    submission_deadline TIMESTAMP WITH TIME ZONE,
    total_revenue DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for artwork submissions to galleries
CREATE TABLE public.gallery_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES public.nft_galleries(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    nft_contract TEXT,
    nft_token_id TEXT,
    price DECIMAL(18, 8) NOT NULL,
    sold BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gallery_id, submitter_id)
);

-- Create table for gallery sales and revenue tracking
CREATE TABLE public.gallery_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.gallery_submissions(id) ON DELETE CASCADE,
    buyer_address TEXT NOT NULL,
    sale_price DECIMAL(18, 8) NOT NULL,
    transaction_hash TEXT,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for revenue distribution to community members
CREATE TABLE public.revenue_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES public.nft_galleries(id) ON DELETE CASCADE,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(18, 8) NOT NULL,
    transaction_hash TEXT,
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.nft_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nft_galleries
CREATE POLICY "Gallery members can view galleries" ON public.nft_galleries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = nft_galleries.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Gallery members can create galleries via proposals" ON public.nft_galleries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = nft_galleries.community_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for gallery_submissions
CREATE POLICY "Members can view submissions in their community galleries" ON public.gallery_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.nft_galleries g
            JOIN public.community_memberships cm ON cm.community_id = g.community_id
            WHERE g.id = gallery_submissions.gallery_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can submit to their community galleries" ON public.gallery_submissions
    FOR INSERT WITH CHECK (
        auth.uid() = submitter_id AND
        EXISTS (
            SELECT 1 FROM public.nft_galleries g
            JOIN public.community_memberships cm ON cm.community_id = g.community_id
            WHERE g.id = gallery_submissions.gallery_id AND cm.user_id = auth.uid()
        )
    );

-- RLS Policies for gallery_sales
CREATE POLICY "Members can view sales in their community galleries" ON public.gallery_sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gallery_submissions gs
            JOIN public.nft_galleries g ON g.id = gs.gallery_id
            JOIN public.community_memberships cm ON cm.community_id = g.community_id
            WHERE gs.id = gallery_sales.submission_id AND cm.user_id = auth.uid()
        )
    );

-- RLS Policies for revenue_distributions
CREATE POLICY "Members can view their own revenue distributions" ON public.revenue_distributions
    FOR SELECT USING (auth.uid() = member_id);
