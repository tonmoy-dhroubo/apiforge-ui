"use client";

import Link from "next/link";
import { LogOut, Menu, UserCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ContentTypeDto } from "@/lib/types";

const MOBILE_LINKS = [
	{ href: "/", label: "Landing" },
	{ href: "/dashboard", label: "Dashboard" },
	{ href: "/content-types", label: "Content Types" },
	{ href: "/media", label: "Media" },
	{ href: "/permissions", label: "Permissions" },
	{ href: "/users", label: "Users" },
];

export function TopBar({
	title,
	user,
	contentTypes,
	loading,
	onLogout,
}: {
	title: string;
	user: Record<string, unknown> | null;
	contentTypes: ContentTypeDto[];
	loading: boolean;
	onLogout: () => void;
}) {
	return (
		<header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl">
			<div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
				<div className="flex min-w-0 items-center gap-3">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="lg:hidden"
								aria-label="Open navigation"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-72 bg-sidebar/90 backdrop-blur-xl"
						>
							<SheetHeader>
								<SheetTitle>ApiForge Studio</SheetTitle>
							</SheetHeader>
							<div className="mt-6 space-y-5">
								<nav className="space-y-2">
									{MOBILE_LINKS.map((item) => (
										<Link
											key={item.href}
											href={item.href}
											className="block rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
										>
											{item.label}
										</Link>
									))}
								</nav>
								<Separator className="bg-sidebar-border" />
								<div className="space-y-2">
									<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
										Collections
										<Badge
											variant="secondary"
											className="bg-sidebar-accent/60"
										>
											{loading
												? "..."
												: contentTypes.length}
										</Badge>
									</div>
									<div className="space-y-1">
										{contentTypes.map((type) => (
											<Link
												key={type.apiId}
												href={`/content/${type.apiId}`}
												className="block rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
											>
												{type.name}
											</Link>
										))}
									</div>
								</div>
							</div>
						</SheetContent>
					</Sheet>
					<Link
						href="/"
						className="flex min-w-0 items-center gap-3"
						aria-label="Go to landing page"
					>
						<Logo showText={false} size={34} />
						<div className="min-w-0">
							<p className="hidden text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground sm:block">
								APIFORGE STUDIO
							</p>
							<h2 className="text-base font-semibold leading-tight text-foreground sm:text-lg lg:text-xl">
								{title}
							</h2>
						</div>
					</Link>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="hidden text-right text-sm text-muted-foreground md:block">
						<p className="text-xs uppercase tracking-[0.2em]">
							Signed in
						</p>
						<p className="font-medium text-foreground">
							{user?.username
								? String(user.username)
								: "Administrator"}
						</p>
					</div>
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						aria-label="Account"
						className="rounded-full border border-border/70 bg-card/60 text-muted-foreground shadow-sm"
					>
						<UserCircle2 className="h-6 w-6" />
					</Button>
					<Button
						variant="secondary"
						className="hidden md:inline-flex"
						onClick={onLogout}
					>
						Logout
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={onLogout}
						aria-label="Log out"
					>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</header>
	);
}
