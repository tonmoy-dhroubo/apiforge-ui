"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { clearAuthToken, getAuthToken } from "@/lib/auth";

export default function LandingPage() {
	const [isAuthed, setIsAuthed] = useState(false);

	useEffect(() => {
		setIsAuthed(Boolean(getAuthToken()));
	}, []);

	const handleSignOut = () => {
		clearAuthToken();
		setIsAuthed(false);
	};
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border/60 bg-background/75 backdrop-blur-xl">
				<div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
					<Logo />
					<div className="flex flex-wrap items-center gap-3">
						{isAuthed ? (
							<Button asChild variant="ghost" size="icon" aria-label="Open dashboard">
								<Link href="/dashboard">
									<UserCircle2 className="h-6 w-6" />
								</Link>
							</Button>
						) : (
							<Button asChild variant="secondary" size="sm">
								<Link href="/login">Sign in</Link>
							</Button>
						)}
						{isAuthed && (
							<Button variant="ghost" size="sm" onClick={handleSignOut}>
								Sign out
							</Button>
						)}
					</div>
				</div>
			</header>
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
				<div className="space-y-6">
					<p className="studio-heading">Content Ops</p>
					<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
						Model content.
						<br />
						Ship APIs.
					</h1>
					<p className="max-w-xl text-sm text-muted-foreground">
						ApiForge Studio helps teams define content types, manage entries,
						and control permissions without touching backend code.
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<Button asChild>
							<Link href={isAuthed ? "/dashboard" : "/login"}>{isAuthed ? "Open Studio" : "Sign in"}</Link>
						</Button>
						<Button asChild variant="ghost">
							<Link href={isAuthed ? "/dashboard" : "/login"}>View access</Link>
						</Button>
					</div>
				</div>
				<div className="glass-panel w-full max-w-md space-y-4 rounded-3xl p-6">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
						Why teams use it
					</p>
					<div className="space-y-3 text-sm text-muted-foreground">
						<p>Define schemas that generate REST endpoints instantly.</p>
						<p>Manage media and content entries in one place.</p>
						<p>Ship permissions and roles without redeploys.</p>
					</div>
				</div>
			</main>
		</div>
	);
}
