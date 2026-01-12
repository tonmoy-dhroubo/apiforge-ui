import {
	clearAuthToken,
	getAuthToken,
	getRefreshToken,
	setAuthToken,
	setRefreshToken,
} from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

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
		const message =
			payload?.error || payload?.message || response.statusText;
		throw new Error(message);
	}

	if (payload && payload.success === false) {
		throw new Error(payload.error || payload.message || "Request failed");
	}

	return payload?.data ?? (payload as T | null);
}

async function refreshAccessToken() {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return false;

	try {
		const response = await fetch(
			buildUrl(API_BASE_URL, "/api/auth/refresh"),
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken }),
			},
		);
		const data = await parseResponse<AuthResponse>(response);
		if (!data?.token || !data?.refreshToken) {
			throw new Error("Invalid refresh response");
		}
		setAuthToken(data.token);
		setRefreshToken(data.refreshToken);
		return true;
	} catch {
		clearAuthToken();
		return false;
	}
}

async function requestWithAuth<T>(
	baseUrl: string,
	path: string,
	options: RequestInit,
): Promise<T | null> {
	const token = getAuthToken();
	const headers = new Headers(options.headers ?? {});
	if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
		headers.set("Content-Type", "application/json");
	}
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(buildUrl(baseUrl, path), {
		...options,
		headers,
	});

	if (response.status === 401) {
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			const retryHeaders = new Headers(options.headers ?? {});
			if (
				!retryHeaders.has("Content-Type") &&
				!(options.body instanceof FormData)
			) {
				retryHeaders.set("Content-Type", "application/json");
			}
			const nextToken = getAuthToken();
			if (nextToken) {
				retryHeaders.set("Authorization", `Bearer ${nextToken}`);
			}
			const retryResponse = await fetch(buildUrl(baseUrl, path), {
				...options,
				headers: retryHeaders,
			});
			return parseResponse<T>(retryResponse);
		}
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("apiforge:unauthorized"));
		}
	}

	return parseResponse<T>(response);
}

export async function apiRequest<T>(
	path: string,
	options: RequestInit = {},
): Promise<T | null> {
	return requestWithAuth<T>(API_BASE_URL, path, options);
}

export async function apiMediaRequest<T>(
	path: string,
	options: RequestInit = {},
): Promise<T | null> {
	return requestWithAuth<T>(MEDIA_BASE_URL, path, options);
}

export { API_BASE_URL, MEDIA_BASE_URL };
