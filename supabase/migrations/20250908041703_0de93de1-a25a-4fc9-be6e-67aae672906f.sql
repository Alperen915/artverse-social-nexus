-- Create DAO tokens table
CREATE TABLE public.dao_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  total_supply NUMERIC NOT NULL,
  token_address TEXT NOT NULL,
  deployment_tx_hash TEXT NOT NULL,
  description TEXT,
  network TEXT NOT NULL DEFAULT 'Sepolia Testnet',
  status TEXT NOT NULL DEFAULT 'deployed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create token marketplace listings table
CREATE TABLE public.token_marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL,
  seller TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  price_per_token NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

-- Create token transactions table
CREATE TABLE public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  price_per_token NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  transaction_hash TEXT NOT NULL,
  block_number BIGINT,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.dao_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for dao_tokens
CREATE POLICY "DAO tokens are viewable by everyone"
  ON public.dao_tokens FOR SELECT
  USING (true);

CREATE POLICY "Community members can create DAO tokens"
  ON public.dao_tokens FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM community_memberships 
      WHERE community_id = dao_tokens.community_id 
      AND user_id = auth.uid()
    )
  );

-- RLS policies for token_marketplace_listings
CREATE POLICY "Token listings are viewable by everyone"
  ON public.token_marketplace_listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own token listings"
  ON public.token_marketplace_listings FOR INSERT
  WITH CHECK (auth.uid()::text = seller);

CREATE POLICY "Users can update their own token listings"
  ON public.token_marketplace_listings FOR UPDATE
  USING (auth.uid()::text = seller);

-- RLS policies for token_transactions
CREATE POLICY "Token transactions are viewable by everyone"
  ON public.token_transactions FOR SELECT
  USING (true);

CREATE POLICY "System can insert token transactions"
  ON public.token_transactions FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_dao_tokens_community_id ON public.dao_tokens(community_id);
CREATE INDEX idx_dao_tokens_creator_id ON public.dao_tokens(creator_id);
CREATE INDEX idx_dao_tokens_token_address ON public.dao_tokens(token_address);
CREATE INDEX idx_token_listings_token_address ON public.token_marketplace_listings(token_address);
CREATE INDEX idx_token_listings_seller ON public.token_marketplace_listings(seller);
CREATE INDEX idx_token_transactions_token_address ON public.token_transactions(token_address);
CREATE INDEX idx_token_transactions_hash ON public.token_transactions(transaction_hash);