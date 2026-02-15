/**
 * Backend API base URL. Faculty submissions go to Supabase; admin views data via this backend.
 * Ensure backend .env uses the same Supabase project (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) so admin sees the same data as faculty.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';
