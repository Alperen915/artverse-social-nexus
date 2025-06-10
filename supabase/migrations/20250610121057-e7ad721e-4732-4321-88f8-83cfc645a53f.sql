
-- Create enum types for various statuses and roles
CREATE TYPE community_role AS ENUM ('admin', 'curator', 'member', 'viewer');
CREATE TYPE proposal_status AS ENUM ('active', 'passed', 'rejected', 'expired');
CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');
CREATE TYPE post_type AS ENUM ('artwork', 'update', 'announcement');

-- Communities table
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    genesis_nft_contract TEXT,
    genesis_nft_collection TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token_gate_contract TEXT,
    token_gate_threshold INTEGER DEFAULT 1,
    governance_token_contract TEXT,
    ipfs_metadata TEXT,
    cover_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community memberships
CREATE TABLE public.community_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role community_role DEFAULT 'member',
    wallet_address TEXT,
    verified_nft_ownership BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Posts/artwork sharing
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    post_type post_type DEFAULT 'artwork',
    media_urls TEXT[],
    ipfs_hash TEXT,
    blockchain_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance proposals
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposal_type TEXT DEFAULT 'general',
    status proposal_status DEFAULT 'active',
    voting_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voting_end TIMESTAMP WITH TIME ZONE,
    yes_votes INTEGER DEFAULT 0,
    no_votes INTEGER DEFAULT 0,
    total_voting_power BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes on proposals
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_choice BOOLEAN, -- true = yes, false = no
    voting_power BIGINT DEFAULT 1,
    wallet_signature TEXT,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, voter_id)
);

-- Events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_or_link TEXT,
    cover_image TEXT,
    status event_status DEFAULT 'upcoming',
    max_attendees INTEGER,
    poap_contract TEXT,
    ipfs_metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT,
    poap_claimed BOOLEAN DEFAULT false,
    rsvp_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- User profiles for additional Web3 data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    wallet_address TEXT UNIQUE,
    ens_name TEXT,
    governance_tokens JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities (public read, authenticated create)
CREATE POLICY "Communities are viewable by everyone" ON public.communities
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Community creators can update their communities" ON public.communities
    FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for memberships
CREATE POLICY "Users can view community memberships" ON public.community_memberships
    FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships" ON public.community_memberships
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "Posts are viewable by community members" ON public.posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = posts.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Community members can create posts" ON public.posts
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = posts.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authors can update their posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for proposals
CREATE POLICY "Proposals are viewable by community members" ON public.proposals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = proposals.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Community members can create proposals" ON public.proposals
    FOR INSERT WITH CHECK (
        auth.uid() = creator_id AND
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = proposals.community_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by community members" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.proposals p
            JOIN public.community_memberships cm ON cm.community_id = p.community_id
            WHERE p.id = votes.proposal_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Community members can vote" ON public.votes
    FOR INSERT WITH CHECK (
        auth.uid() = voter_id AND
        EXISTS (
            SELECT 1 FROM public.proposals p
            JOIN public.community_memberships cm ON cm.community_id = p.community_id
            WHERE p.id = votes.proposal_id AND cm.user_id = auth.uid()
        )
    );

-- RLS Policies for events
CREATE POLICY "Events are viewable by community members" ON public.events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = events.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Community members can create events" ON public.events
    FOR INSERT WITH CHECK (
        auth.uid() = host_id AND
        EXISTS (
            SELECT 1 FROM public.community_memberships 
            WHERE community_id = events.community_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for event RSVPs
CREATE POLICY "RSVPs are viewable by community members" ON public.event_rsvps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events e
            JOIN public.community_memberships cm ON cm.community_id = e.community_id
            WHERE e.id = event_rsvps.event_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can RSVP to events" ON public.event_rsvps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
