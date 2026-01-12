"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
	Boxes,
	ChevronLeft,
	ChevronRight,
	FileText,
	FolderKanban,
	KeyRound,
	LayoutGrid,
	ShieldCheck,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ContentTypeDto } from "@/lib/types";

const NAV_ITEMS = [
	{ href: "/", label: "Dashboard", icon: LayoutGrid },
	{ href: "/content-types", label: "Content Types", icon: Boxes },
	{ href: "/media", label: "Media Library", icon: FolderKanban },
	{ href: "/permissions", label: "Permissions", icon: ShieldCheck },
	{ href: "/users", label: "Users", icon: Users },
];

const SIDEBAR_COLLAPSED_KEY = "apiforge:sidebar-collapsed";

export function Sidebar({
	contentTypes,
	loading,
}: {
	contentTypes: ContentTypeDto[];
	loading: boolean;
}) {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(() => {
		if (typeof window === "undefined") return false;
		try {
			return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
		} catch {
			return false;
		}
	});

	const toggleCollapsed = () => {
		setCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
			} catch {
				// ignore
			}
			return next;
		});
	};

	const collectionItems = useMemo(() => {
		return contentTypes.map((type) => {
			const href = `/content/${type.apiId}`;
			const active = pathname === href;
			const link = (
				<Link
					key={type.apiId}
					href={href}
					title={type.name}
					aria-label={type.name}
					className={cn(
						"flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
						active &&
							"bg-sidebar-accent text-sidebar-accent-foreground",
						collapsed && "justify-center px-2",
					)}
				>
					<FileText className="h-4 w-4" />
					{collapsed ? (
						<span className="sr-only">{type.name}</span>
					) : (
						<>
							<span className="flex-1 truncate">{type.name}</span>
							<Badge
								variant="secondary"
								className="bg-sidebar-primary/20 text-sidebar-foreground"
							>
								{type.fields?.length ?? 0}
							</Badge>
						</>
					)}
				</Link>
			);

			if (!collapsed) return link;

			return (
				<Tooltip key={type.apiId}>
					<TooltipTrigger asChild>{link}</TooltipTrigger>
					<TooltipContent side="right" sideOffset={12}>
						{type.name}
					</TooltipContent>
				</Tooltip>
			);
		});
	}, [collapsed, contentTypes, pathname]);

	return (
		<aside
			className={cn(
				"hidden h-screen flex-col border-r border-sidebar-border bg-sidebar/80 text-sidebar-foreground backdrop-blur transition-[width] duration-200 lg:flex",
				collapsed ? "w-20" : "w-72",
			)}
		>
			<div
				className={cn(
					"border-b border-sidebar-border",
					collapsed
						? "flex flex-col items-center gap-3 px-3 py-4"
						: "flex items-center gap-3 px-6 py-5",
				)}
			>
				<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
					<KeyRound className="h-5 w-5" />
				</div>
				{!collapsed && (
					<div>
						<p className="text-sm font-semibold uppercase tracking-widest text-sidebar-foreground/60 font-mono">
							ApiForge
						</p>
						<h1 className="text-lg font-semibold">Studio</h1>
					</div>
				)}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={toggleCollapsed}
							aria-label={
								collapsed
									? "Expand sidebar"
									: "Collapse sidebar"
							}
							className={cn(!collapsed && "ml-auto")}
						>
							{collapsed ? (
								<ChevronRight className="h-4 w-4" />
							) : (
								<ChevronLeft className="h-4 w-4" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={12}>
						{collapsed ? "Expand" : "Collapse"}
					</TooltipContent>
				</Tooltip>
			</div>
			<ScrollArea
				className={cn("flex-1", collapsed ? "px-2 py-4" : "px-4 py-6")}
			>
				<div className="space-y-6">
					<div className="space-y-2">
						{!collapsed && (
							<p className="px-2 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
								Core
							</p>
						)}
						<nav className="space-y-1">
							{NAV_ITEMS.map((item) => {
								const Icon = item.icon;
								const active = pathname === item.href;
								const link = (
									<Link
										key={item.href}
										href={item.href}
										title={item.label}
										aria-label={item.label}
										className={cn(
											"flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
											active
												? "bg-sidebar-accent text-sidebar-accent-foreground"
												: "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
											collapsed && "justify-center px-2",
										)}
									>
										<Icon className="h-4 w-4" />
										{collapsed ? (
											<span className="sr-only">
												{item.label}
											</span>
										) : (
											item.label
										)}
									</Link>
								);

								if (!collapsed) return link;

								return (
									<Tooltip key={item.href}>
										<TooltipTrigger asChild>
											{link}
										</TooltipTrigger>
										<TooltipContent
											side="right"
											sideOffset={12}
										>
											{item.label}
										</TooltipContent>
									</Tooltip>
								);
							})}
						</nav>
					</div>
					<div className="space-y-3">
						<div
							className={cn(
								"flex items-center justify-between px-2",
								collapsed && "justify-center",
							)}
						>
							{!collapsed && (
								<p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
									Collections
								</p>
							)}
							<Badge
								variant="secondary"
								className="bg-sidebar-accent/70"
							>
								{loading ? "..." : contentTypes.length}
							</Badge>
						</div>
						<div className="space-y-1">
							{contentTypes.length === 0 &&
								!loading &&
								!collapsed && (
									<div className="rounded-xl border border-dashed border-sidebar-border px-3 py-3 text-xs text-sidebar-foreground/60">
										No content types yet. Create one to
										unlock collections.
									</div>
								)}
							{contentTypes.length === 0 &&
								!loading &&
								collapsed && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center justify-center rounded-xl border border-dashed border-sidebar-border px-3 py-3 text-xs text-sidebar-foreground/60">
												—
											</div>
										</TooltipTrigger>
										<TooltipContent
											side="right"
											sideOffset={12}
										>
											No collections yet
										</TooltipContent>
									</Tooltip>
								)}
							{collectionItems}
						</div>
					</div>
				</div>
			</ScrollArea>
		</aside>
	);
}
