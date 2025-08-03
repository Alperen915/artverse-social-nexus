-- Fix function search path security issue for handle_dao_membership_payment
DROP FUNCTION IF EXISTS handle_dao_membership_payment(uuid, uuid, numeric);

CREATE OR REPLACE FUNCTION public.handle_dao_membership_payment(community_id_param uuid, user_id_param uuid, fee_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    user_balance numeric;
    community_is_free boolean;
    required_fee numeric;
BEGIN
    -- Check if community membership is free
    SELECT membership_is_free, membership_token_requirement 
    INTO community_is_free, required_fee
    FROM public.communities 
    WHERE id = community_id_param;
    
    -- If membership is free, allow joining
    IF community_is_free THEN
        RETURN true;
    END IF;
    
    -- Get user's current BROS balance
    SELECT balance INTO user_balance 
    FROM public.user_token_balances 
    WHERE user_id = user_id_param AND token_symbol = 'BROS';
    
    -- Check if user has sufficient balance
    IF user_balance < required_fee THEN
        RETURN false;
    END IF;
    
    -- Deduct membership fee from user
    UPDATE public.user_token_balances 
    SET balance = balance - required_fee,
        updated_at = now()
    WHERE user_id = user_id_param AND token_symbol = 'BROS';
    
    -- Add fee to DAO treasury
    UPDATE public.communities 
    SET dao_treasury_balance = dao_treasury_balance + required_fee
    WHERE id = community_id_param;
    
    RETURN true;
END;
$$;

-- Fix function search path security issue for split_event_cost_among_dao_members
DROP FUNCTION IF EXISTS split_event_cost_among_dao_members(uuid, numeric);

CREATE OR REPLACE FUNCTION public.split_event_cost_among_dao_members(event_id_param uuid, total_cost numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    community_id_val uuid;
    member_count integer;
    cost_per_member numeric;
    member_record RECORD;
BEGIN
    -- Get community_id from event (assuming this is a DAO event proposal)
    -- For now, we'll handle this through the application layer
    -- This function will be called when a DAO votes to attend a paid public event
    
    -- Get number of DAO members
    SELECT COUNT(*) INTO member_count
    FROM public.community_memberships cm
    WHERE cm.community_id = community_id_val;
    
    -- Calculate cost per member
    IF member_count > 0 THEN
        cost_per_member := total_cost / member_count;
        
        -- Deduct cost from each member's balance
        FOR member_record IN 
            SELECT user_id 
            FROM public.community_memberships 
            WHERE community_id = community_id_val
        LOOP
            UPDATE public.user_token_balances
            SET balance = balance - cost_per_member,
                updated_at = now()
            WHERE user_id = member_record.user_id 
            AND token_symbol = 'BROS'
            AND balance >= cost_per_member;
        END LOOP;
    END IF;
END;
$$;