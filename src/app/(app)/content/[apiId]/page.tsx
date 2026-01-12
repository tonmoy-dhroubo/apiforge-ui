"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { apiMediaRequest, apiRequest } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { ContentEntry, ContentTypeDto, FieldDto, MediaDto } from "@/lib/types";
import { formatDate, truncateMiddle } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SpinnerEmpty } from "@/components/spinner-empty";

export default function ContentEntriesPage() {
	const params = useParams();
	const apiId = String(params.apiId || "");
	const [contentType, setContentType] = useState<ContentTypeDto | null>(null);
	const [entries, setEntries] = useState<ContentEntry[]>([]);
	const [media, setMedia] = useState<MediaDto[]>([]);
	const [form, setForm] = useState<Record<string, unknown>>({});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState("updated_desc");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [visibleFieldNames, setVisibleFieldNames] = useState<string[]>([]);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [relationField, setRelationField] = useState<FieldDto | null>(null);
	const [relationEntries, setRelationEntries] = useState<ContentEntry[]>([]);
	const [relationSearch, setRelationSearch] = useState("");
	const [relationLoading, setRelationLoading] = useState(false);
	const [viewLoaded, setViewLoaded] = useState(false);
	const [draftLoaded, setDraftLoaded] = useState(false);
	const [userKey, setUserKey] = useState("anonymous");
	const [savingDraft, setSavingDraft] = useState(false);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [typeData, entryData, mediaData] = await Promise.all([
				apiRequest<ContentTypeDto>(
					`/api/content-types/api-id/${apiId}`,
				),
				apiRequest<ContentEntry[]>(`/api/content/${apiId}`),
				apiMediaRequest<MediaDto[]>("/api/upload"),
			]);
			setContentType(typeData ?? null);
			setEntries(entryData ?? []);
			setMedia(mediaData ?? []);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to load content",
			);
		} finally {
			setIsLoading(false);
		}
	}, [apiId]);

	useEffect(() => {
		if (apiId) {
			loadData();
		}
	}, [apiId, loadData]);

	useEffect(() => {
		if (!contentType?.fields?.length || viewLoaded) return;
		setVisibleFieldNames(
			contentType.fields.slice(0, 3).map((field) => field.fieldName),
		);
	}, [contentType?.id, viewLoaded]);

	useEffect(() => {
		const user = getAuthUser();
		setUserKey(user?.username ? String(user.username) : "anonymous");
	}, []);

	const viewKey = `apiforge:view:${apiId}:${userKey}`;
	const draftKey = `apiforge:draft:${apiId}:${userKey}`;

	useEffect(() => {
		setViewLoaded(false);
		setDraftLoaded(false);
	}, [viewKey, draftKey]);

	useEffect(() => {
		if (!apiId) return;
		try {
			const raw = window.localStorage.getItem(viewKey);
			if (raw) {
				const parsed = JSON.parse(raw) as {
					search?: string;
					sort?: string;
					pageSize?: number;
					visibleFieldNames?: string[];
				};
				if (parsed.search !== undefined) setSearch(parsed.search);
				if (parsed.sort) setSort(parsed.sort);
				if (parsed.pageSize) setPageSize(parsed.pageSize);
				if (parsed.visibleFieldNames?.length) {
					setVisibleFieldNames(parsed.visibleFieldNames);
				}
			}
		} catch {
			// ignore stored view errors
		} finally {
			setViewLoaded(true);
		}
	}, [apiId, viewKey]);

	useEffect(() => {
		if (!viewLoaded) return;
		try {
			window.localStorage.setItem(
				viewKey,
				JSON.stringify({ search, sort, pageSize, visibleFieldNames }),
			);
		} catch {
			// ignore storage errors
		}
	}, [search, sort, pageSize, visibleFieldNames, viewKey, viewLoaded]);

	useEffect(() => {
		if (!apiId) return;
		try {
			const raw = window.localStorage.getItem(draftKey);
			if (raw) {
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				setForm(parsed);
			}
		} catch {
			// ignore
		} finally {
			setDraftLoaded(true);
		}
	}, [apiId, draftKey]);

	useEffect(() => {
		if (!draftLoaded) return;
		setSavingDraft(true);
		const handle = window.setTimeout(() => {
			try {
				window.localStorage.setItem(draftKey, JSON.stringify(form));
			} catch {
				// ignore
			} finally {
				setSavingDraft(false);
			}
		}, 400);
		return () => window.clearTimeout(handle);
	}, [form, draftKey, draftLoaded]);

	const handleValueChange = (field: FieldDto, value: unknown) => {
		setForm((prev) => ({ ...prev, [field.fieldName]: value }));
		setFormErrors((prev) => {
			if (!prev[field.fieldName]) return prev;
			const next = { ...prev };
			delete next[field.fieldName];
			return next;
		});
	};

	const handleSubmit = async () => {
		const nextErrors: Record<string, string> = {};
		(contentType?.fields ?? []).forEach((field) => {
			if (!field.required) return;
			const value = form[field.fieldName];
			const missing =
				value === undefined ||
				value === null ||
				(typeof value === "string" && value.trim() === "");
			if (missing) {
				nextErrors[field.fieldName] = "Required field.";
			}
		});

		if (Object.keys(nextErrors).length > 0) {
			setFormErrors(nextErrors);
			toast.error("Fill in the required fields.");
			return;
		}

		setLoading(true);
		try {
			await apiRequest(`/api/content/${apiId}`, {
				method: "POST",
				body: JSON.stringify(form),
			});
			toast.success("Entry created");
			setForm({});
			setFormErrors({});
			try {
				window.localStorage.removeItem(draftKey);
			} catch {
				// ignore
			}
			loadData();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to create entry",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (entryId: number) => {
		try {
			await apiRequest(`/api/content/${apiId}/${entryId}`, {
				method: "DELETE",
			});
			toast.success("Entry deleted");
			loadData();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to delete entry",
			);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedIds.length === 0) return;
		try {
			await Promise.allSettled(
				selectedIds.map((entryId) =>
					apiRequest(`/api/content/${apiId}/${entryId}`, {
						method: "DELETE",
					}),
				),
			);
			toast.success(
				`Deleted ${selectedIds.length} entr${selectedIds.length === 1 ? "y" : "ies"}.`,
			);
			setSelectedIds([]);
			loadData();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to delete entries",
			);
		}
	};

	const exportSelected = (format: "json" | "csv") => {
		if (selectedIds.length === 0) return;
		const selectedEntries = entries.filter((entry) =>
			selectedIds.includes(Number(entry.id)),
		);
		if (format === "json") {
			const blob = new Blob([JSON.stringify(selectedEntries, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${apiId}-entries.json`;
			link.click();
			URL.revokeObjectURL(url);
			return;
		}

		const fieldNames = [
			"id",
			...(contentType?.fields ?? []).map((field) => field.fieldName),
			"updated_at",
		];
		const csvRows = [
			fieldNames.join(","),
			...selectedEntries.map((entry) =>
				fieldNames
					.map((name) => {
						const value = entry[name];
						const text =
							value === undefined || value === null
								? ""
								: String(value);
						return `"${text.replace(/"/g, '""')}"`;
					})
					.join(","),
			),
		];
		const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${apiId}-entries.csv`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const clearDraft = () => {
		setForm({});
		try {
			window.localStorage.removeItem(draftKey);
		} catch {
			// ignore
		}
	};

	useEffect(() => {
		if (!relationField?.targetContentType) return;
		const loadRelations = async () => {
			setRelationLoading(true);
			try {
				const data = await apiRequest<ContentEntry[]>(
					`/api/content/${relationField.targetContentType}`,
				);
				setRelationEntries(data ?? []);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Unable to load relations",
				);
			} finally {
				setRelationLoading(false);
			}
		};

		loadRelations();
	}, [relationField?.targetContentType]);

	const visibleFields = useMemo(() => {
		const fields = contentType?.fields ?? [];
		if (visibleFieldNames.length === 0) return fields.slice(0, 3);
		return fields.filter((field) =>
			visibleFieldNames.includes(field.fieldName),
		);
	}, [contentType, visibleFieldNames]);

	const filteredEntries = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return entries;
		return entries.filter((entry) => {
			const idMatch = String(entry.id ?? "").includes(query);
			const fieldMatch = visibleFields.some((field) => {
				const value = entry[field.fieldName];
				if (value === undefined || value === null) return false;
				return String(value).toLowerCase().includes(query);
			});
			return idMatch || fieldMatch;
		});
	}, [entries, search, visibleFields]);

	const sortedEntries = useMemo(() => {
		const items = [...filteredEntries];
		const getUpdated = (entry: ContentEntry) =>
			new Date((entry.updated_at as string | undefined) ?? 0).getTime();
		items.sort((a, b) => {
			switch (sort) {
				case "updated_asc":
					return getUpdated(a) - getUpdated(b);
				case "id_asc":
					return Number(a.id ?? 0) - Number(b.id ?? 0);
				case "id_desc":
					return Number(b.id ?? 0) - Number(a.id ?? 0);
				case "updated_desc":
				default:
					return getUpdated(b) - getUpdated(a);
			}
		});
		return items;
	}, [filteredEntries, sort]);

	const totalPages = Math.max(1, Math.ceil(sortedEntries.length / pageSize));
	const pagedEntries = sortedEntries.slice(
		(page - 1) * pageSize,
		page * pageSize,
	);

	useEffect(() => {
		setPage(1);
	}, [search, sort, pageSize]);

	useEffect(() => {
		setSelectedIds([]);
	}, [search, sort, pageSize, entries, page]);

	const relationFilteredEntries = useMemo(() => {
		const query = relationSearch.trim().toLowerCase();
		if (!query) return relationEntries;
		return relationEntries.filter((entry) => {
			const values = Object.values(entry ?? {});
			return values.some((value) =>
				String(value ?? "")
					.toLowerCase()
					.includes(query),
			);
		});
	}, [relationEntries, relationSearch]);

	const copyToClipboard = async (value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Unable to copy");
		}
	};

	const renderField = (field: FieldDto) => {
		const value = form[field.fieldName];
		switch (field.type) {
			case "LONG_TEXT":
				return (
					<Textarea
						value={(value as string) ?? ""}
						onChange={(event) =>
							handleValueChange(field, event.target.value)
						}
						placeholder={field.name}
					/>
				);
			case "RICH_TEXT":
				return (
					<RichTextEditor
						value={(value as string) ?? ""}
						onChange={(nextValue) =>
							handleValueChange(field, nextValue)
						}
						placeholder={field.name}
					/>
				);
			case "NUMBER":
				return (
					<Input
						type="number"
						value={
							value === undefined || value === null
								? ""
								: String(value)
						}
						onChange={(event) => {
							const raw = event.target.value;
							handleValueChange(
								field,
								raw === "" ? null : Number(raw),
							);
						}}
					/>
				);
			case "BOOLEAN":
				return (
					<div className="flex items-center gap-3">
						<Switch
							checked={Boolean(value)}
							onCheckedChange={(checked) =>
								handleValueChange(field, checked)
							}
						/>
						<span className="text-xs text-muted-foreground">
							{value ? "Enabled" : "Disabled"}
						</span>
					</div>
				);
			case "DATETIME":
				return (
					<Input
						type="datetime-local"
						value={(value as string) ?? ""}
						onChange={(event) =>
							handleValueChange(field, event.target.value)
						}
					/>
				);
			case "MEDIA":
				return (
					<Select
						value={value ? String(value) : undefined}
						onValueChange={(val) =>
							handleValueChange(field, Number(val))
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select media" />
						</SelectTrigger>
						<SelectContent>
							{media.map((asset) => (
								<SelectItem
									key={asset.id}
									value={String(asset.id)}
								>
									{asset.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			case "RELATION":
				return (
					<div className="space-y-2">
						<div className="flex flex-wrap gap-2">
							<Input
								type="number"
								value={
									value === undefined || value === null
										? ""
										: String(value)
								}
								onChange={(event) => {
									const raw = event.target.value;
									handleValueChange(
										field,
										raw === "" ? null : Number(raw),
									);
								}}
								placeholder={`Related ${field.targetContentType ?? "id"}`}
							/>
							<Button
								type="button"
								variant="secondary"
								onClick={() => setRelationField(field)}
								disabled={!field.targetContentType}
							>
								Pick relation
							</Button>
						</div>
						{value !== undefined && value !== null && (
							<p className="text-xs text-muted-foreground">
								Selected ID: {String(value)}
							</p>
						)}
					</div>
				);
			default:
				return (
					<Input
						value={(value as string) ?? ""}
						onChange={(event) =>
							handleValueChange(field, event.target.value)
						}
						placeholder={field.name}
					/>
				);
		}
	};

	return (
		<div className="space-y-6">
			<Card className="glass-panel">
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<CardTitle>
								{contentType?.name ?? "Content"}
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								API ID: {contentType?.apiId ?? apiId}
							</p>
						</div>
						<Badge variant="secondary">
							{contentType?.fields?.length ?? 0} fields
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoading ? (
						<SpinnerEmpty />
					) : contentType?.fields?.length ? (
						<div className="grid gap-4 lg:grid-cols-2">
							{contentType.fields.map((field) => (
								<div
									key={field.fieldName}
									className="space-y-2"
								>
									<label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
										{field.name}
									</label>
									{renderField(field)}
									{formErrors[field.fieldName] && (
										<p className="text-xs text-destructive">
											{formErrors[field.fieldName]}
										</p>
									)}
									{field.type === "MEDIA" &&
										media.length === 0 && (
											<p className="text-xs text-muted-foreground">
												No media available.{" "}
												<Link
													href="/media"
													className="underline"
												>
													Upload assets
												</Link>
												.
											</p>
										)}
									{field.type === "RELATION" && (
										<p className="text-xs text-muted-foreground">
											Provide the related entry ID for{" "}
											{field.targetContentType ??
												"collection"}
											.
										</p>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
							No fields defined yet. Add fields in the content
							type builder.
						</div>
					)}
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="text-xs text-muted-foreground">
							{savingDraft
								? "Saving draft..."
								: draftLoaded
									? "Draft saved"
									: ""}
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="ghost"
								onClick={clearDraft}
								disabled={
									!draftLoaded ||
									Object.keys(form).length === 0
								}
							>
								Discard draft
							</Button>
							<Button onClick={handleSubmit} disabled={loading}>
								{loading ? "Saving..." : "Create Entry"}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>API Helper</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Endpoints
						</p>
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
							<span className="font-mono">{`GET ${API_BASE_URL}/api/content/${apiId}`}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									copyToClipboard(
										`${API_BASE_URL}/api/content/${apiId}`,
									)
								}
							>
								Copy URL
							</Button>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
							<span className="font-mono">{`POST ${API_BASE_URL}/api/content/${apiId}`}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									copyToClipboard(
										`${API_BASE_URL}/api/content/${apiId}`,
									)
								}
							>
								Copy URL
							</Button>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2">
							<span className="font-mono">{`DELETE ${API_BASE_URL}/api/content/${apiId}/{id}`}</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									copyToClipboard(
										`${API_BASE_URL}/api/content/${apiId}/{id}`,
									)
								}
							>
								Copy URL
							</Button>
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Curl
						</p>
						<div className="rounded-lg border border-border/60 bg-background/70 p-3">
							<code className="block text-xs">
								{`curl -X GET ${API_BASE_URL}/api/content/${apiId} -H "Authorization: Bearer <token>"`}
							</code>
							<div className="mt-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										copyToClipboard(
											`curl -X GET ${API_BASE_URL}/api/content/${apiId} -H "Authorization: Bearer <token>"`,
										)
									}
								>
									Copy curl
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>Entries</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
						<Input
							placeholder="Search entries"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="w-full sm:max-w-xs"
						/>
						<Select value={sort} onValueChange={setSort}>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="updated_desc">
									Updated (newest)
								</SelectItem>
								<SelectItem value="updated_asc">
									Updated (oldest)
								</SelectItem>
								<SelectItem value="id_desc">
									ID (desc)
								</SelectItem>
								<SelectItem value="id_asc">ID (asc)</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={String(pageSize)}
							onValueChange={(value) =>
								setPageSize(Number(value))
							}
						>
							<SelectTrigger className="w-full sm:w-36">
								<SelectValue placeholder="Rows per page" />
							</SelectTrigger>
							<SelectContent>
								{[5, 10, 20, 30].map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size} rows
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="secondary"
									size="sm"
									className="w-full sm:w-auto"
								>
									Visible fields
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Columns</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(contentType?.fields ?? []).map((field) => (
									<DropdownMenuCheckboxItem
										key={field.fieldName}
										checked={visibleFieldNames.includes(
											field.fieldName,
										)}
										onCheckedChange={(checked) => {
											setVisibleFieldNames((prev) => {
												if (checked) {
													return prev.includes(
														field.fieldName,
													)
														? prev
														: [
																...prev,
																field.fieldName,
															];
												}
												return prev.filter(
													(name) =>
														name !==
														field.fieldName,
												);
											});
										}}
									>
										{field.name}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
						<div>{selectedIds.length} selected</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedIds([])}
								disabled={selectedIds.length === 0}
							>
								Clear
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => exportSelected("json")}
								disabled={selectedIds.length === 0}
							>
								Export JSON
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => exportSelected("csv")}
								disabled={selectedIds.length === 0}
							>
								Export CSV
							</Button>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="destructive"
										size="sm"
										disabled={selectedIds.length === 0}
									>
										Delete selected
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Delete {selectedIds.length} entr
											{selectedIds.length === 1
												? "y"
												: "ies"}
											?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleDeleteSelected}
										>
											Confirm delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-10">
									<Checkbox
										checked={
											pagedEntries.length > 0 &&
											pagedEntries.every((entry) =>
												selectedIds.includes(
													Number(entry.id),
												),
											)
										}
										onCheckedChange={(checked) => {
											if (checked) {
												const next = pagedEntries.map(
													(entry) => Number(entry.id),
												);
												setSelectedIds((prev) =>
													Array.from(
														new Set([
															...prev,
															...next,
														]),
													),
												);
											} else {
												const remove = new Set(
													pagedEntries.map((entry) =>
														Number(entry.id),
													),
												);
												setSelectedIds((prev) =>
													prev.filter(
														(id) => !remove.has(id),
													),
												);
											}
										}}
										aria-label="Select all entries on this page"
									/>
								</TableHead>
								<TableHead>ID</TableHead>
								{visibleFields.map((field) => (
									<TableHead key={field.fieldName}>
										{field.name}
									</TableHead>
								))}
								<TableHead>Updated</TableHead>
								<TableHead className="text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading &&
								Array.from({ length: 5 }).map((_, index) => (
									<TableRow
										key={`skeleton-${index}`}
										className="animate-pulse"
									>
										<TableCell
											colSpan={visibleFields.length + 4}
										>
											<div className="h-4 w-3/4 rounded bg-muted/40" />
										</TableCell>
									</TableRow>
								))}
							{!isLoading &&
								pagedEntries.map((entry) => (
									<TableRow key={String(entry.id)}>
										<TableCell>
											<Checkbox
												checked={selectedIds.includes(
													Number(entry.id),
												)}
												onCheckedChange={(checked) => {
													if (checked) {
														setSelectedIds(
															(prev) => [
																...prev,
																Number(
																	entry.id,
																),
															],
														);
													} else {
														setSelectedIds((prev) =>
															prev.filter(
																(id) =>
																	id !==
																	Number(
																		entry.id,
																	),
															),
														);
													}
												}}
												aria-label={`Select entry ${String(entry.id)}`}
											/>
										</TableCell>
										<TableCell className="font-medium">
											{String(entry.id ?? "-")}
										</TableCell>
										{visibleFields.map((field) => (
											<TableCell key={field.fieldName}>
												{entry[field.fieldName]
													? truncateMiddle(
															String(
																entry[
																	field
																		.fieldName
																],
															),
														)
													: "-"}
											</TableCell>
										))}
										<TableCell>
											{formatDate(
												entry.updated_at as
													| string
													| undefined,
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-2">
												<Dialog>
													<DialogTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
														>
															View
														</Button>
													</DialogTrigger>
													<DialogContent className="max-h-[80vh] overflow-y-auto">
														<DialogHeader>
															<DialogTitle>
																Entry{" "}
																{String(
																	entry.id,
																)}
															</DialogTitle>
														</DialogHeader>
														<pre className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
															{JSON.stringify(
																entry,
																null,
																2,
															)}
														</pre>
													</DialogContent>
												</Dialog>
												<Button
													variant="destructive"
													size="sm"
													onClick={() =>
														handleDelete(
															Number(entry.id),
														)
													}
												>
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							{!isLoading && sortedEntries.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={visibleFields.length + 4}
										className="text-center text-sm text-muted-foreground"
									>
										No entries yet.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
						<div>
							Showing {pagedEntries.length} of{" "}
							{sortedEntries.length} entries
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setPage((prev) => Math.max(1, prev - 1))
								}
								disabled={page <= 1}
							>
								Previous
							</Button>
							<div>
								Page {page} of {totalPages}
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setPage((prev) =>
										Math.min(totalPages, prev + 1),
									)
								}
								disabled={page >= totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog
				open={Boolean(relationField)}
				onOpenChange={(open) => {
					if (!open) {
						setRelationField(null);
						setRelationSearch("");
						setRelationEntries([]);
					}
				}}
			>
				<DialogContent className="max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Pick related entry for{" "}
							{relationField?.name ?? "relation"}
						</DialogTitle>
					</DialogHeader>
					{relationField?.targetContentType ? (
						<div className="space-y-3">
							<Input
								placeholder="Search entries"
								value={relationSearch}
								onChange={(event) =>
									setRelationSearch(event.target.value)
								}
							/>
							{relationLoading ? (
								<SpinnerEmpty />
							) : (
								<div className="space-y-2">
									{relationFilteredEntries.map((entry) => (
										<button
											key={String(entry.id)}
											type="button"
											className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left text-sm hover:bg-accent"
											onClick={() => {
												if (!relationField) return;
												handleValueChange(
													relationField,
													Number(entry.id),
												);
												setRelationField(null);
												setRelationSearch("");
												setRelationEntries([]);
											}}
										>
											<span className="font-medium">
												ID {String(entry.id ?? "-")}
											</span>
											<span className="text-xs text-muted-foreground">
												{truncateMiddle(
													JSON.stringify(entry),
												)}
											</span>
										</button>
									))}
									{relationFilteredEntries.length === 0 && (
										<div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
											No entries match your search.
										</div>
									)}
								</div>
							)}
						</div>
					) : (
						<div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
							No target content type defined for this relation.
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
