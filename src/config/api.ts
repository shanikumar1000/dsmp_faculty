/**
 * Backend API base URL. Faculty submissions go to Supabase; admin views data via this backend.
 * Ensure backend .env uses the same Supabase project (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) so admin sees the same data as faculty.
 */
const PRODUCTION_API_URL = 'https://dsmp-faculty-1.onrender.com';
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string)?.trim() || 
  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') ? PRODUCTION_API_URL : 'http://localhost:5000');
