-- Allow events to be created without community (public events)
ALTER TABLE public.events 
ALTER COLUMN community_id DROP NOT NULL;

-- Add public events table for better organization
CREATE TABLE public.public_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  venue_or_link text,
  max_attendees integer,
  cover_image text,
  created_at timestamp with time zone DEFAULT now(),
  host_id uuid,
  status text DEFAULT 'upcoming'
);

-- Enable RLS for public events
ALTER TABLE public.public_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public events
CREATE POLICY "Public events are viewable by everyone" 
ON public.public_events 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create public events" 
ON public.public_events 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Event hosts can update their public events" 
ON public.public_events 
FOR UPDATE 
USING (auth.uid() = host_id);

-- Create public event RSVPs table
CREATE TABLE public.public_event_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.public_events(id) ON DELETE CASCADE,
  user_id uuid,
  email text,
  name text,
  rsvp_at timestamp with time zone DEFAULT now(),
  wallet_address text
);

-- Enable RLS for public event RSVPs
ALTER TABLE public.public_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for public event RSVPs
CREATE POLICY "Public event RSVPs are viewable by event hosts" 
ON public.public_event_rsvps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.public_events pe 
  WHERE pe.id = public_event_rsvps.event_id 
  AND pe.host_id = auth.uid()
));

CREATE POLICY "Anyone can RSVP to public events" 
ON public.public_event_rsvps 
FOR INSERT 
WITH CHECK (true);