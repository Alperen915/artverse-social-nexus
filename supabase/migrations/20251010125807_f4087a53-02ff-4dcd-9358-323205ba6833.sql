-- Multi-sig Wallet Tables
CREATE TABLE public.dao_multisig_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  required_signatures INTEGER NOT NULL DEFAULT 2,
  signers TEXT[] NOT NULL DEFAULT '{}',
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pending_multisig_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.dao_multisig_wallets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  to_address TEXT NOT NULL,
  description TEXT,
  signatures TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

-- Vote Delegation System
CREATE TABLE public.vote_delegations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delegator_id UUID NOT NULL,
  delegate_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(delegator_id, community_id, active)
);

-- Proposal Templates
CREATE TABLE public.proposal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  description TEXT,
  default_fields JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add template_id to proposals
ALTER TABLE public.proposals 
ADD COLUMN template_id UUID REFERENCES public.proposal_templates(id);

-- Treasury Transactions
CREATE TABLE public.treasury_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  from_address TEXT,
  to_address TEXT,
  transaction_hash TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Proposal Automated Actions
CREATE TABLE public.proposal_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_params JSONB NOT NULL DEFAULT '{}',
  executed BOOLEAN NOT NULL DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  execution_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dao_multisig_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_multisig_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Multisig Wallets
CREATE POLICY "Community members can view multisig wallets"
ON public.dao_multisig_wallets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE community_id = dao_multisig_wallets.community_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Community admins can create multisig wallets"
ON public.dao_multisig_wallets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE community_id = dao_multisig_wallets.community_id
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

-- RLS Policies for Pending Transactions
CREATE POLICY "Signers can view pending transactions"
ON public.pending_multisig_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dao_multisig_wallets w
    WHERE w.id = pending_multisig_transactions.wallet_id
    AND auth.uid()::text = ANY(w.signers)
  )
);

CREATE POLICY "Signers can create pending transactions"
ON public.pending_multisig_transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dao_multisig_wallets w
    WHERE w.id = pending_multisig_transactions.wallet_id
    AND auth.uid()::text = ANY(w.signers)
  )
);

CREATE POLICY "System can update pending transactions"
ON public.pending_multisig_transactions FOR UPDATE
USING (true);

-- RLS Policies for Vote Delegations
CREATE POLICY "Users can view delegations in their communities"
ON public.vote_delegations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE community_id = vote_delegations.community_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own delegations"
ON public.vote_delegations FOR INSERT
WITH CHECK (auth.uid() = delegator_id);

CREATE POLICY "Users can update their own delegations"
ON public.vote_delegations FOR UPDATE
USING (auth.uid() = delegator_id);

-- RLS Policies for Proposal Templates
CREATE POLICY "Templates are viewable by everyone"
ON public.proposal_templates FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create templates"
ON public.proposal_templates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for Treasury Transactions
CREATE POLICY "Community members can view treasury transactions"
ON public.treasury_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE community_id = treasury_transactions.community_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "System can insert treasury transactions"
ON public.treasury_transactions FOR INSERT
WITH CHECK (true);

-- RLS Policies for Proposal Actions
CREATE POLICY "Community members can view proposal actions"
ON public.proposal_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.proposals p
    JOIN public.community_memberships cm ON cm.community_id = p.community_id
    WHERE p.id = proposal_actions.proposal_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Proposal creators can create actions"
ON public.proposal_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.proposals
    WHERE id = proposal_actions.proposal_id
    AND creator_id = auth.uid()
  )
);

-- Insert default proposal templates
INSERT INTO public.proposal_templates (template_name, template_type, description, default_fields, is_system) VALUES
('Treasury Spending', 'treasury', 'Propose spending from DAO treasury', 
 '{"amount": 0, "recipient": "", "purpose": ""}', true),
('New Member Admission', 'membership', 'Propose admitting new members to DAO', 
 '{"wallet_address": "", "reason": ""}', true),
('Event Funding', 'event', 'Propose funding for community events', 
 '{"event_name": "", "budget": 0, "date": ""}', true),
('Gallery Creation', 'gallery', 'Propose creating new NFT gallery', 
 '{"title": "", "submission_deadline": "", "nft_price": 50}', true),
('Parameter Change', 'parameter', 'Propose changing DAO parameters', 
 '{"parameter": "", "current_value": "", "new_value": ""}', true);

-- Function to calculate delegated voting power
CREATE OR REPLACE FUNCTION public.get_voting_power(voter_id UUID, comm_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_power INTEGER := 1;
  delegated_power INTEGER := 0;
BEGIN
  -- Count delegations to this user
  SELECT COUNT(*) INTO delegated_power
  FROM public.vote_delegations
  WHERE delegate_id = voter_id
  AND community_id = comm_id
  AND active = true;
  
  RETURN base_power + delegated_power;
END;
$$;

-- Function to execute proposal actions when voting ends
CREATE OR REPLACE FUNCTION public.execute_proposal_actions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_record RECORD;
  total_votes INTEGER;
  approval_threshold NUMERIC;
BEGIN
  -- Only execute if proposal just changed to passed
  IF NEW.status = 'passed' AND OLD.status != 'passed' THEN
    total_votes := NEW.yes_votes + NEW.no_votes;
    
    -- Check if proposal passed with >50% yes votes
    IF total_votes > 0 THEN
      approval_threshold := NEW.yes_votes::NUMERIC / total_votes::NUMERIC;
      
      IF approval_threshold > 0.5 THEN
        -- Execute all actions for this proposal
        FOR action_record IN 
          SELECT * FROM public.proposal_actions 
          WHERE proposal_id = NEW.id AND executed = false
        LOOP
          -- Mark as executed (actual execution would happen in edge function)
          UPDATE public.proposal_actions
          SET executed = true, executed_at = now()
          WHERE id = action_record.id;
        END LOOP;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for automatic action execution
CREATE TRIGGER execute_actions_on_proposal_pass
AFTER UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.execute_proposal_actions();