-- Fix security warnings by adding security definer settings to functions
DROP FUNCTION IF EXISTS create_submission_requirements();
DROP FUNCTION IF EXISTS update_submission_count();
DROP FUNCTION IF EXISTS distribute_gallery_revenue(UUID);

-- Recreate functions with proper security definer settings
CREATE OR REPLACE FUNCTION create_submission_requirements()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION update_submission_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION distribute_gallery_revenue(gallery_id_param UUID)
RETURNS TABLE(user_id UUID, payout_amount DECIMAL) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS trigger_create_submission_requirements ON public.nft_galleries;
DROP TRIGGER IF EXISTS trigger_update_submission_count ON public.gallery_submissions;

CREATE TRIGGER trigger_create_submission_requirements
    AFTER UPDATE ON public.nft_galleries
    FOR EACH ROW
    EXECUTE FUNCTION create_submission_requirements();

CREATE TRIGGER trigger_update_submission_count
    AFTER INSERT ON public.gallery_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_submission_count();