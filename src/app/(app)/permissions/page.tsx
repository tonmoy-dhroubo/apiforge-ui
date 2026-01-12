"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
	CONTENT_ACTIONS,
	PERMISSION_METHODS,
	ROLE_OPTIONS,
} from "@/lib/constants";
import {
	ApiPermissionDto,
	ContentPermissionDto,
	ContentTypeDto,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SpinnerEmpty } from "@/components/spinner-empty";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

function RolePicker({
	value,
	onChange,
}: {
	value: string[];
	onChange: (roles: string[]) => void;
}) {
	return (
		<div className="flex flex-wrap gap-4">
			{ROLE_OPTIONS.map((role) => (
				<label key={role} className="flex items-center gap-2 text-xs">
					<Checkbox
						checked={value.includes(role)}
						onCheckedChange={(checked) => {
							if (checked) {
								onChange([...value, role]);
							} else {
								onChange(value.filter((item) => item !== role));
							}
						}}
					/>
					{role}
				</label>
			))}
		</div>
	);
}

export default function PermissionsPage() {
	const [apiPermissions, setApiPermissions] = useState<ApiPermissionDto[]>(
		[],
	);
	const [contentPermissions, setContentPermissions] = useState<
		ContentPermissionDto[]
	>([]);
	const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [apiForm, setApiForm] = useState({
		contentTypeApiId: "",
		endpoint: "/api/content",
		method: "GET",
		allowedRoles: ["SUPER_ADMIN"],
	});
	const [contentForm, setContentForm] = useState({
		contentTypeApiId: "",
		action: "READ",
		allowedRoles: ["SUPER_ADMIN"],
	});

	const loadAll = useCallback(async () => {
		setIsLoading(true);
		try {
			const [apiData, contentData, types] = await Promise.all([
				apiRequest<ApiPermissionDto[]>("/api/permissions/api"),
				apiRequest<ContentPermissionDto[]>("/api/permissions/content"),
				apiRequest<ContentTypeDto[]>("/api/content-types"),
			]);
			setApiPermissions(apiData ?? []);
			setContentPermissions(contentData ?? []);
			setContentTypes(types ?? []);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to load permissions",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadAll();
	}, [loadAll]);

	const handleCreateApi = async () => {
		try {
			await apiRequest("/api/permissions/api", {
				method: "POST",
				body: JSON.stringify(apiForm),
			});
			toast.success("API permission created");
			loadAll();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to create permission",
			);
		}
	};

	const handleCreateContent = async () => {
		try {
			await apiRequest("/api/permissions/content", {
				method: "POST",
				body: JSON.stringify(contentForm),
			});
			toast.success("Content permission created");
			loadAll();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to create permission",
			);
		}
	};

	const apiOptions = useMemo(
		() => contentTypes.map((t) => t.apiId),
		[contentTypes],
	);

	if (isLoading) {
		return <SpinnerEmpty />;
	}

	return (
		<div className="space-y-6">
			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>Permissions Matrix</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="api" className="space-y-4">
						<TabsList>
							<TabsTrigger value="api">
								API Permissions
							</TabsTrigger>
							<TabsTrigger value="content">
								Content Permissions
							</TabsTrigger>
						</TabsList>
						<TabsContent value="api" className="space-y-4">
							<Card className="border border-border/60 bg-background/70">
								<CardHeader>
									<CardTitle className="text-sm">
										Create API Permission
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid gap-3 md:grid-cols-3">
										<Select
											value={
												apiForm.contentTypeApiId ||
												undefined
											}
											onValueChange={(value) =>
												setApiForm((prev) => ({
													...prev,
													contentTypeApiId: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Content type" />
											</SelectTrigger>
											<SelectContent>
												{apiOptions.map((type) => (
													<SelectItem
														key={type}
														value={type}
													>
														{type}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Input
											value={apiForm.endpoint}
											onChange={(event) =>
												setApiForm((prev) => ({
													...prev,
													endpoint:
														event.target.value,
												}))
											}
											placeholder="/api/content/articles"
										/>
										<Select
											value={apiForm.method}
											onValueChange={(value) =>
												setApiForm((prev) => ({
													...prev,
													method: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Method" />
											</SelectTrigger>
											<SelectContent>
												{PERMISSION_METHODS.map(
													(method) => (
														<SelectItem
															key={method}
															value={method}
														>
															{method}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</div>
									<RolePicker
										value={apiForm.allowedRoles}
										onChange={(roles) =>
											setApiForm((prev) => ({
												...prev,
												allowedRoles: roles,
											}))
										}
									/>
									<Button onClick={handleCreateApi}>
										Save API Permission
									</Button>
								</CardContent>
							</Card>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Content Type</TableHead>
										<TableHead>Endpoint</TableHead>
										<TableHead>Method</TableHead>
										<TableHead>Roles</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{apiPermissions.map((permission) => (
										<TableRow key={permission.id}>
											<TableCell>
												{permission.contentTypeApiId}
											</TableCell>
											<TableCell>
												{permission.endpoint}
											</TableCell>
											<TableCell>
												{permission.method}
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-2">
													{permission.allowedRoles.map(
														(role) => (
															<Badge
																key={role}
																variant="secondary"
															>
																{role}
															</Badge>
														),
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
									{apiPermissions.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-center text-sm text-muted-foreground"
											>
												No API permissions configured.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TabsContent>

						<TabsContent value="content" className="space-y-4">
							<Card className="border border-border/60 bg-background/70">
								<CardHeader>
									<CardTitle className="text-sm">
										Create Content Permission
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid gap-3 md:grid-cols-2">
										<Select
											value={
												contentForm.contentTypeApiId ||
												undefined
											}
											onValueChange={(value) =>
												setContentForm((prev) => ({
													...prev,
													contentTypeApiId: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Content type" />
											</SelectTrigger>
											<SelectContent>
												{apiOptions.map((type) => (
													<SelectItem
														key={type}
														value={type}
													>
														{type}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Select
											value={contentForm.action}
											onValueChange={(value) =>
												setContentForm((prev) => ({
													...prev,
													action: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Action" />
											</SelectTrigger>
											<SelectContent>
												{CONTENT_ACTIONS.map(
													(action) => (
														<SelectItem
															key={action}
															value={action}
														>
															{action}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</div>
									<RolePicker
										value={contentForm.allowedRoles}
										onChange={(roles) =>
											setContentForm((prev) => ({
												...prev,
												allowedRoles: roles,
											}))
										}
									/>
									<Button onClick={handleCreateContent}>
										Save Content Permission
									</Button>
								</CardContent>
							</Card>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Content Type</TableHead>
										<TableHead>Action</TableHead>
										<TableHead>Roles</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{contentPermissions.map((permission) => (
										<TableRow key={permission.id}>
											<TableCell>
												{permission.contentTypeApiId}
											</TableCell>
											<TableCell>
												{permission.action}
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-2">
													{permission.allowedRoles.map(
														(role) => (
															<Badge
																key={role}
																variant="secondary"
															>
																{role}
															</Badge>
														),
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
									{contentPermissions.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={3}
												className="text-center text-sm text-muted-foreground"
											>
												No content permissions
												configured.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
