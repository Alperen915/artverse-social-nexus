-- Add mandatory submission tracking for galleries
ALTER TABLE public.nft_galleries ADD COLUMN mandatory_submission BOOLEAN DEFAULT true;
ALTER TABLE public.nft_galleries ADD COLUMN min_submissions_per_member INTEGER DEFAULT 1;

-- Create table for tracking submission requirements
CREATE TABLE public.gallery_submission_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES public.nft_galleries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    required_submissions INTEGER DEFAULT 1,
    current_submissions INTEGER DEFAULT 0,
    is_compliant BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gallery_id, user_id)
);

-- Create table for public NFT marketplace (all approved galleries)
CREATE TABLE public.public_nft_marketplace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.gallery_submissions(id) ON DELETE CASCADE,
    mint_id UUID REFERENCES public.nft_mints(id) ON DELETE CASCADE,
    price DECIMAL(18, 8) NOT NULL,
    seller_address TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    buyer_address TEXT,
    transaction_hash TEXT
);

-- Create table for revenue distribution tracking
CREATE TABLE public.revenue_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES public.nft_galleries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(18, 8) NOT NULL,
    payout_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.gallery_submission_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_nft_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gallery_submission_requirements
CREATE POLICY "Users can view their own submission requirements" ON public.gallery_submission_requirements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage submission requirements" ON public.gallery_submission_requirements
    FOR ALL USING (true);

-- RLS Policies for public_nft_marketplace (public marketplace for all approved galleries)
CREATE POLICY "Public marketplace is viewable by everyone" ON public.public_nft_marketplace
    FOR SELECT USING (true);

CREATE POLICY "Users can list their own NFTs" ON public.public_nft_marketplace
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.gallery_submissions gs
            WHERE gs.id = public_nft_marketplace.submission_id 
            AND gs.submitter_id = auth.uid()
        )
    );

-- RLS Policies for revenue_payouts
CREATE POLICY "Users can view their own payouts" ON public.revenue_payouts
    FOR SELECT USING (auth.uid() = user_id);

-- Trigger to automatically create submission requirements when gallery becomes active
CREATE OR REPLACE FUNCTION create_submission_requirements()
RETURNS TRIGGER AS $$
BEGIN
    -- When a gallery status changes to 'active', create requirements for all community members
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
        INSERT INTO public.gallery_submission_requirements (gallery_id, user_id, required_submissions)
        SELECT 
            NEW.id,
            cm.user_id,
            NEW.min_submissions_per_member
        FROM public.community_memberships cm
        WHERE cm.community_id = NEW.community_id
        ON CONFLICT (gallery_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_submission_requirements
    AFTER UPDATE ON public.nft_galleries
    FOR EACH ROW
    EXECUTE FUNCTION create_submission_requirements();

-- Trigger to update submission counts
CREATE OR REPLACE FUNCTION update_submission_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update submission count when new submission is added
    UPDATE public.gallery_submission_requirements 
    SET 
        current_submissions = current_submissions + 1,
        is_compliant = (current_submissions + 1) >= required_submissions,
        updated_at = NOW()
    WHERE gallery_id = NEW.gallery_id AND user_id = NEW.submitter_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_submission_count
    AFTER INSERT ON public.gallery_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_submission_count();

-- Function to calculate and distribute revenue
CREATE OR REPLACE FUNCTION distribute_gallery_revenue(gallery_id_param UUID)
RETURNS TABLE(user_id UUID, payout_amount DECIMAL) AS $$
DECLARE
    total_revenue DECIMAL;
    member_count INTEGER;
    revenue_per_member DECIMAL;
BEGIN
    -- Get total revenue for the gallery
    SELECT COALESCE(SUM(sale_price), 0) INTO total_revenue
    FROM public.gallery_sales gs
    JOIN public.gallery_submissions gsub ON gsub.id = gs.submission_id
    WHERE gsub.gallery_id = gallery_id_param;
    
    -- Get count of community members who submitted to this gallery
    SELECT COUNT(DISTINCT submitter_id) INTO member_count
    FROM public.gallery_submissions
    WHERE gallery_id = gallery_id_param;
    
    -- Calculate revenue per member
    IF member_count > 0 THEN
        revenue_per_member := total_revenue / member_count;
        
        -- Return user_id and payout amount for each submitter
        RETURN QUERY
        SELECT DISTINCT gs.submitter_id, revenue_per_member
        FROM public.gallery_submissions gs
        WHERE gs.gallery_id = gallery_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;