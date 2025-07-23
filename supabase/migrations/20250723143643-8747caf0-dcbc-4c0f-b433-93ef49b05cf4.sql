-- Add DAO features to communities table
ALTER TABLE public.communities 
ADD COLUMN is_dao boolean DEFAULT false,
ADD COLUMN bros_chain_address text,
ADD COLUMN membership_token_requirement numeric DEFAULT 0,
ADD COLUMN membership_is_free boolean DEFAULT true,
ADD COLUMN dao_treasury_balance numeric DEFAULT 0,
ADD COLUMN artverse_status text DEFAULT 'local' CHECK (artverse_status IN ('local', 'transferring', 'transferred')),
ADD COLUMN artverse_transfer_date timestamp with time zone,
ADD COLUMN bros_chain_network text DEFAULT 'Bros Chain Testnet';

-- Create table for simulated Bros Chain token balances
CREATE TABLE public.user_token_balances (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_symbol text NOT NULL DEFAULT 'BROS',
    balance numeric NOT NULL DEFAULT 0,
    chain_name text NOT NULL DEFAULT 'Bros Chain',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, token_symbol, chain_name)
);

-- Create table for Artverse transfer history
CREATE TABLE public.artverse_transfers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
    initiated_by uuid REFERENCES public.profiles(id),
    transfer_status text DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'completed', 'failed')),
    artverse_dao_id text,
    bros_chain_tx_hash text,
    transfer_date timestamp with time zone DEFAULT now(),
    completion_date timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on new tables
ALTER TABLE public.user_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artverse_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_token_balances
CREATE POLICY "Users can view their own token balances" 
ON public.user_token_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own token balances" 
ON public.user_token_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage token balances" 
ON public.user_token_balances 
FOR ALL 
USING (true);

-- RLS policies for artverse_transfers
CREATE POLICY "Community members can view transfers" 
ON public.artverse_transfers 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.community_memberships cm 
    WHERE cm.community_id = artverse_transfers.community_id 
    AND cm.user_id = auth.uid()
));

CREATE POLICY "Community members can initiate transfers" 
ON public.artverse_transfers 
FOR INSERT 
WITH CHECK (auth.uid() = initiated_by AND EXISTS (
    SELECT 1 FROM public.community_memberships cm 
    WHERE cm.community_id = artverse_transfers.community_id 
    AND cm.user_id = auth.uid()
));

-- Insert some simulated token data for existing users
INSERT INTO public.user_token_balances (user_id, token_symbol, balance, chain_name)
SELECT 
    p.id,
    'BROS',
    FLOOR(RANDOM() * 10000 + 100) as balance,
    'Bros Chain'
FROM public.profiles p
ON CONFLICT (user_id, token_symbol, chain_name) DO NOTHING;

-- Update some communities to be DAOs
UPDATE public.communities 
SET 
    is_dao = true,
    bros_chain_address = CONCAT('0x', MD5(RANDOM()::text)),
    membership_token_requirement = CASE 
        WHEN RANDOM() > 0.5 THEN FLOOR(RANDOM() * 1000 + 50)
        ELSE 0 
    END,
    membership_is_free = CASE 
        WHEN RANDOM() > 0.5 THEN false
        ELSE true 
    END,
    dao_treasury_balance = FLOOR(RANDOM() * 50000 + 1000)
WHERE RANDOM() > 0.3;