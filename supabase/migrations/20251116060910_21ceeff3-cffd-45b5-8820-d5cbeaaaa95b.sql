-- Platform settings table for BROS token config
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform settings are viewable by everyone"
  ON public.platform_settings FOR SELECT
  USING (true);

CREATE POLICY "Only system can manage platform settings"
  ON public.platform_settings FOR ALL
  USING (false);

-- Insert BROS token configuration
INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES ('bros_token', '{
  "networks": {
    "sepolia": "0x0000000000000000000000000000000000000000",
    "bros_testnet": "0x0000000000000000000000000000000000000000",
    "bros_mainnet": "0x0000000000000000000000000000000000000000"
  },
  "primary_network": "bros_testnet",
  "decimals": 18,
  "symbol": "BROS",
  "name": "Bros Token"
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Extend user_token_balances table
ALTER TABLE public.user_token_balances
  ADD COLUMN IF NOT EXISTS chain_id text DEFAULT '0xaa36a7',
  ADD COLUMN IF NOT EXISTS last_synced timestamptz DEFAULT now();

-- Create faucet claims tracking table
CREATE TABLE IF NOT EXISTS public.faucet_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  wallet_address text NOT NULL,
  amount text NOT NULL,
  chain_id text NOT NULL,
  claimed_at timestamptz DEFAULT now(),
  tx_hash text
);

ALTER TABLE public.faucet_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own faucet claims"
  ON public.faucet_claims FOR SELECT
  USING (auth.uid() = user_id OR true);

CREATE POLICY "System can insert faucet claims"
  ON public.faucet_claims FOR INSERT
  WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_faucet_claims_wallet_time 
  ON public.faucet_claims(wallet_address, claimed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_chain 
  ON public.user_token_balances(user_id, chain_id, token_symbol);