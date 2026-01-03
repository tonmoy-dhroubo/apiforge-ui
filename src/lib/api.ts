import { getAuthToken } from "@/lib/auth";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "http://localhost:8084";

function buildUrl(baseUrl: string, path: string) {
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseResponse<T>(response: Response) {
  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    const message = payload?.error || payload?.message || response.statusText;
    throw new Error(message);
  }

  if (payload && payload.success === false) {
    throw new Error(payload.error || payload.message || "Request failed");
  }

  return payload?.data ?? (payload as T | null);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = getAuthToken();
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(API_BASE_URL, path), {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}

export async function apiMediaRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = getAuthToken();
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(MEDIA_BASE_URL, path), {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}

export { API_BASE_URL, MEDIA_BASE_URL };
