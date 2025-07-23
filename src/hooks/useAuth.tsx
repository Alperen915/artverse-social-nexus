
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Create profile if user exists but no profile
        if (session?.user) {
          await ensureProfile(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session?.user?.email || 'No session');
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Create profile for new users (defer to avoid blocking)
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            ensureProfile(session.user);
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || '',
            display_name: user.user_metadata?.full_name || '',
          });

        if (error) {
          console.error('Error creating profile:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('SignUp error:', error);
        return { data: null, error };
      }
      
      console.log('SignUp successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('SignUp exception:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('SignIn error:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('SignIn exception:', error);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SignOut error:', error);
      }
      return { error };
    } catch (error) {
      console.error('SignOut exception:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
