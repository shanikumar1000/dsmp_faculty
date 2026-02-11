import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  employee_id: string;
  google_scholar_id: string | null;
  years_of_experience: number | null;
  specialization: string | null;
  contact_number: string | null;
  role: string;
  total_publications?: number;
  total_citations?: number;
  h_index?: number;
  performance_score?: number;
  performance_category?: string;
  last_analyzed_at?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('No profile found');
      }

      setProfile(data as Profile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No user logged in');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      console.log(`Faculty profile updated for ${user.id}`);

      await fetchProfile();

      return { success: true };
    } catch (err) {
      console.error('Failed to update profile:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update profile',
      };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
