import { API_BASE_URL } from '../config/api';

const BACKEND_TIMEOUT_MS = 90000; // 90s for Render cold start
const RETRY_DELAY_MS = 3000;
const MAX_RETRIES = 2;

/**
 * Fetch from backend with long timeout and retries (handles Render free-tier cold start).
 */
export async function fetchBackend(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  throw lastError ?? new Error('Request failed');
}
