-- NFT Auctions System
CREATE TABLE public.nft_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_contract TEXT NOT NULL,
  token_id TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  starting_price NUMERIC NOT NULL,
  current_bid NUMERIC DEFAULT 0,
  highest_bidder TEXT,
  reserve_price NUMERIC,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES public.nft_auctions(id) ON DELETE CASCADE,
  bidder_address TEXT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT Bundles
CREATE TABLE public.nft_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_address TEXT,
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES public.nft_bundles(id) ON DELETE CASCADE,
  nft_contract TEXT NOT NULL,
  token_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT Royalties
CREATE TABLE public.nft_royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_contract TEXT NOT NULL,
  token_id TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  royalty_percentage NUMERIC NOT NULL CHECK (royalty_percentage >= 0 AND royalty_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nft_contract, token_id)
);

CREATE TABLE public.royalty_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_transaction_hash TEXT NOT NULL,
  nft_contract TEXT NOT NULL,
  token_id TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  distributed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT Lending/Renting
CREATE TABLE public.nft_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_contract TEXT NOT NULL,
  token_id TEXT NOT NULL,
  lender_address TEXT NOT NULL,
  renter_address TEXT,
  daily_rate NUMERIC NOT NULL,
  collateral_amount NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'completed', 'cancelled')),
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT Price Analytics
CREATE TABLE public.nft_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_contract TEXT NOT NULL,
  token_id TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sale_type TEXT NOT NULL CHECK (sale_type IN ('direct', 'auction', 'bundle')),
  marketplace TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_auctions_status ON public.nft_auctions(status);
CREATE INDEX idx_auctions_end_time ON public.nft_auctions(end_time);
CREATE INDEX idx_bundles_status ON public.nft_bundles(status);
CREATE INDEX idx_rentals_status ON public.nft_rentals(status);
CREATE INDEX idx_price_history_nft ON public.nft_price_history(nft_contract, token_id);

-- RLS Policies
ALTER TABLE public.nft_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_price_history ENABLE ROW LEVEL SECURITY;

-- Auctions policies
CREATE POLICY "Auctions are viewable by everyone" ON public.nft_auctions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create auctions" ON public.nft_auctions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Auction bids policies
CREATE POLICY "Bids are viewable by everyone" ON public.auction_bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON public.auction_bids FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Bundles policies
CREATE POLICY "Bundles are viewable by everyone" ON public.nft_bundles FOR SELECT USING (true);
CREATE POLICY "Users can create their own bundles" ON public.nft_bundles FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Bundle items policies
CREATE POLICY "Bundle items are viewable by everyone" ON public.bundle_items FOR SELECT USING (true);
CREATE POLICY "Bundle creators can add items" ON public.bundle_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.nft_bundles WHERE id = bundle_id AND creator_id = auth.uid())
);

-- Royalties policies
CREATE POLICY "Royalties are viewable by everyone" ON public.nft_royalties FOR SELECT USING (true);
CREATE POLICY "System can manage royalties" ON public.nft_royalties FOR ALL USING (true);

-- Royalty distributions policies
CREATE POLICY "Distributions are viewable by everyone" ON public.royalty_distributions FOR SELECT USING (true);
CREATE POLICY "System can insert distributions" ON public.royalty_distributions FOR INSERT WITH CHECK (true);

-- Rentals policies
CREATE POLICY "Rentals are viewable by everyone" ON public.nft_rentals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rentals" ON public.nft_rentals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Price history policies
CREATE POLICY "Price history is viewable by everyone" ON public.nft_price_history FOR SELECT USING (true);
CREATE POLICY "System can insert price history" ON public.nft_price_history FOR INSERT WITH CHECK (true);