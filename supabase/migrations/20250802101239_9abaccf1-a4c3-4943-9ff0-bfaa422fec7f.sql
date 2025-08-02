-- Create function to safely increment vote counts
CREATE OR REPLACE FUNCTION public.increment_vote_count(
    proposal_id uuid,
    is_yes_vote boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    IF is_yes_vote THEN
        UPDATE public.proposals 
        SET yes_votes = yes_votes + 1
        WHERE id = proposal_id;
    ELSE
        UPDATE public.proposals 
        SET no_votes = no_votes + 1
        WHERE id = proposal_id;
    END IF;
END;
$function$