"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiMediaRequest, apiRequest } from "@/lib/api";
import { ContentTypeDto, MediaDto, UserDto } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { SpinnerEmpty } from "@/components/spinner-empty";

export default function DashboardPage() {
	const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
	const [media, setMedia] = useState<MediaDto[]>([]);
	const [users, setUsers] = useState<UserDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			try {
				const [types, mediaList, userList] = await Promise.all([
					apiRequest<ContentTypeDto[]>("/api/content-types"),
					apiMediaRequest<MediaDto[]>("/api/upload"),
					apiRequest<UserDto[]>("/api/auth/users"),
				]);
				setContentTypes(types ?? []);
				setMedia(mediaList ?? []);
				setUsers(userList ?? []);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Unable to load dashboard",
				);
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, []);

	if (isLoading) {
		return <SpinnerEmpty />;
	}

	return (
		<div className="space-y-6">
			<section className="grid gap-4 lg:grid-cols-3">
				{[
					{
						label: "Content Types",
						value: contentTypes.length,
						href: "/content-types",
					},
					{
						label: "Media Assets",
						value: media.length,
						href: "/media",
					},
					{
						label: "Active Users",
						value: users.length,
						href: "/users",
					},
				].map((card) => (
					<Card key={card.label} className="glass-panel">
						<CardHeader className="flex flex-row items-start justify-between">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{card.label}
							</CardTitle>
							<Badge
								variant="outline"
								className="border-primary/40 text-primary"
							>
								Live
							</Badge>
						</CardHeader>
						<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-3xl font-semibold text-foreground">
								{card.value}
							</p>
							<Button asChild variant="ghost" className="text-xs">
								<Link href={card.href}>Open</Link>
							</Button>
						</CardContent>
					</Card>
				))}
			</section>

			<section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
				<Card className="glass-panel">
					<CardHeader>
						<CardTitle>Recently Updated Content Types</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{contentTypes.slice(0, 6).map((type) => (
							<div
								key={type.id}
								className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<p className="font-medium text-foreground">
										{type.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{type.apiId} -{" "}
										{type.fields?.length ?? 0} fields
									</p>
								</div>
								<div className="text-right text-xs text-muted-foreground">
									<p>Updated</p>
									<p className="font-medium text-foreground">
										{formatDate(type.updatedAt)}
									</p>
								</div>
							</div>
						))}
						{contentTypes.length === 0 && (
							<div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
								No content types yet. Start by creating your
								first collection.
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="glass-panel">
					<CardHeader>
						<CardTitle>Launchpad</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2 rounded-xl bg-background/70 p-4">
							<p className="text-sm font-semibold">
								Create a content type
							</p>
							<p className="text-xs text-muted-foreground">
								Define fields and relations before capturing
								entries.
							</p>
							<Button asChild size="sm">
								<Link href="/content-types">Open Builder</Link>
							</Button>
						</div>
						<div className="space-y-2 rounded-xl bg-background/70 p-4">
							<p className="text-sm font-semibold">
								Upload new assets
							</p>
							<p className="text-xs text-muted-foreground">
								Manage media files for rich content.
							</p>
							<Button asChild size="sm" variant="secondary">
								<Link href="/media">Go to Library</Link>
							</Button>
						</div>
						<div className="space-y-2 rounded-xl bg-background/70 p-4">
							<p className="text-sm font-semibold">
								Lock down permissions
							</p>
							<p className="text-xs text-muted-foreground">
								Set role access for API endpoints and entries.
							</p>
							<Button asChild size="sm" variant="outline">
								<Link href="/permissions">Manage Access</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
