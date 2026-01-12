"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { setAuthToken, setAuthUser, setRefreshToken } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/brand/logo";
import { getAuthToken } from "@/lib/auth";

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (getAuthToken()) {
			router.push("/dashboard");
		}
	}, [router]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		try {
			const response = await apiRequest<AuthResponse>("/api/auth/login", {
				method: "POST",
				body: JSON.stringify({ username, password }),
			});

			if (!response?.token) {
				throw new Error("Invalid credentials");
			}

			setAuthToken(response.token);
			setRefreshToken(response.refreshToken);
			setAuthUser({
				username: response.username,
				email: response.email,
				roles: response.roles,
			});
			toast.success("Welcome back to ApiForge");
			router.push("/dashboard");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to sign in",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-10">
			<div className="w-full max-w-5xl items-center gap-10 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
				<div className="hidden space-y-6 lg:block">
					<p className="studio-heading">Studio Access</p>
					<div className="space-y-3">
						<Logo />
						<h1 className="text-4xl font-semibold tracking-tight text-foreground">
							Model content. Ship APIs.
						</h1>
						<p className="max-w-md text-sm text-muted-foreground">
							Sign in to manage content types, permissions, users,
							and media — all backed by your ApiForge gateway.
						</p>
					</div>
					<div className="space-y-3 text-sm text-muted-foreground">
						{[
							"Create schemas that generate REST endpoints",
							"Upload assets to the media service",
							"Control API + content permissions by role",
						].map((item) => (
							<div key={item} className="flex items-start gap-3">
								<span className="mt-0.5 font-mono text-primary">
									▹
								</span>
								<span>{item}</span>
							</div>
						))}
					</div>
				</div>

				<Card className="glass-panel w-full max-w-md justify-self-end">
					<CardHeader>
						<CardTitle className="text-2xl">
							ApiForge Studio
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Sign in with your ApiForge credentials to manage
							content.
						</p>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
									Username
								</label>
								<Input
									value={username}
									onChange={(event) =>
										setUsername(event.target.value)
									}
									placeholder="super_admin"
									required
								/>
							</div>
							<div className="space-y-2">
								<label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
									Password
								</label>
								<Input
									type="password"
									value={password}
									onChange={(event) =>
										setPassword(event.target.value)
									}
									placeholder="********"
									required
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading ? "Signing in..." : "Sign in"}
							</Button>
						</form>
						<Separator className="my-6" />
						<div className="space-y-2 text-xs text-muted-foreground">
							<p>
								Tip: Register new users through the Auth Service
								endpoint
								<span className="font-mono">
									{" "}
									/api/auth/register
								</span>
								.
							</p>
							<p>
								Default gateway URL:{" "}
								<span className="font-mono">
									http://localhost:7080
								</span>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
