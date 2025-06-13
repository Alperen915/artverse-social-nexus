
-- Create table for NFT minting operations
CREATE TABLE public.nft_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.gallery_submissions(id) ON DELETE CASCADE,
    minter_address TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    token_id TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    mint_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata_uri TEXT,
    gas_used BIGINT,
    gas_price BIGINT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed'))
);

-- Create table for marketplace listings
CREATE TABLE public.nft_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mint_id UUID REFERENCES public.nft_mints(id) ON DELETE CASCADE,
    seller_address TEXT NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    marketplace TEXT NOT NULL, -- 'opensea', 'custom', etc.
    listing_hash TEXT,
    transaction_hash TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create table for blockchain transactions
CREATE TABLE public.blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash TEXT UNIQUE NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT,
    value DECIMAL(18, 8) DEFAULT 0,
    gas_used BIGINT,
    gas_price BIGINT,
    block_number BIGINT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    transaction_type TEXT NOT NULL, -- 'mint', 'transfer', 'sale', etc.
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nft_mints
CREATE POLICY "Users can view mints from their community galleries" ON public.nft_mints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gallery_submissions gs
            JOIN public.nft_galleries g ON g.id = gs.gallery_id
            JOIN public.community_memberships cm ON cm.community_id = g.community_id
            WHERE gs.id = nft_mints.submission_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create mints for their submissions" ON public.nft_mints
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.gallery_submissions gs
            WHERE gs.id = nft_mints.submission_id AND gs.submitter_id = auth.uid()
        )
    );

-- RLS Policies for nft_listings
CREATE POLICY "Users can view listings from their community galleries" ON public.nft_listings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.nft_mints nm
            JOIN public.gallery_submissions gs ON gs.id = nm.submission_id
            JOIN public.nft_galleries g ON g.id = gs.gallery_id
            JOIN public.community_memberships cm ON cm.community_id = g.community_id
            WHERE nm.id = nft_listings.mint_id AND cm.user_id = auth.uid()
        )
    );

-- RLS Policies for blockchain_transactions
CREATE POLICY "Users can view transactions they initiated" ON public.blockchain_transactions
    FOR SELECT USING (
        from_address IN (
            SELECT wallet_address FROM public.profiles WHERE id = auth.uid()
        ) OR
        to_address IN (
            SELECT wallet_address FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX idx_nft_mints_submission_id ON public.nft_mints(submission_id);
CREATE INDEX idx_nft_mints_contract_token ON public.nft_mints(contract_address, token_id);
CREATE INDEX idx_nft_listings_mint_id ON public.nft_listings(mint_id);
CREATE INDEX idx_blockchain_tx_hash ON public.blockchain_transactions(tx_hash);
CREATE INDEX idx_blockchain_from_addr ON public.blockchain_transactions(from_address);
