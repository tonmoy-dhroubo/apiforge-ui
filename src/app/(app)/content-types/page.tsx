"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { FIELD_TYPES, RELATION_TYPES } from "@/lib/constants";
import { ContentTypeDto, FieldDto, FieldType } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const emptyField = (): FieldDto => ({
	name: "",
	fieldName: "",
	type: "SHORT_TEXT",
	required: false,
	unique: false,
	targetContentType: "",
	relationType: "ONE_TO_ONE",
});

export default function ContentTypesPage() {
	const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [formErrors, setFormErrors] = useState<{
		name?: string;
		pluralName?: string;
		apiId?: string;
		fields?: string;
		fieldErrors?: Record<
			number,
			{ name?: string; fieldName?: string; targetContentType?: string }
		>;
	}>({});
	const [form, setForm] = useState({
		name: "",
		pluralName: "",
		apiId: "",
		description: "",
		fields: [emptyField()],
	});
	const pageSize = 8;
	const apiIdRegex = /^[a-z][a-z0-9-]*$/;
	const fieldNameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

	const slugify = (value: string) =>
		value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

	const resetForm = () => {
		setForm({
			name: "",
			pluralName: "",
			apiId: "",
			description: "",
			fields: [emptyField()],
		});
		setFormErrors({});
	};

	const loadContentTypes = useCallback(async () => {
		setIsLoading(true);
		try {
			const data =
				await apiRequest<ContentTypeDto[]>("/api/content-types");
			setContentTypes(data ?? []);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to load content types",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadContentTypes();
	}, [loadContentTypes]);

	const handleFieldChange = (
		index: number,
		key: keyof FieldDto,
		value: FieldDto[keyof FieldDto],
	) => {
		setForm((prev) => {
			const fields = [...prev.fields];
			fields[index] = { ...fields[index], [key]: value } as FieldDto;
			return { ...prev, fields };
		});
		setFormErrors((prev) => {
			if (!prev.fieldErrors?.[index] && !prev.fields) return prev;
			const nextFieldErrors = { ...prev.fieldErrors };
			delete nextFieldErrors[index];
			return { ...prev, fields: undefined, fieldErrors: nextFieldErrors };
		});
	};

	const removeField = (index: number) => {
		setForm((prev) => {
			const fields = prev.fields.filter((_, idx) => idx !== index);
			return { ...prev, fields: fields.length ? fields : [emptyField()] };
		});
	};

	const handleCreate = async () => {
		const nextErrors: typeof formErrors = {};
		const fieldErrors: Record<
			number,
			{ name?: string; fieldName?: string; targetContentType?: string }
		> = {};

		if (!form.name.trim()) nextErrors.name = "Name is required.";
		if (!form.pluralName.trim())
			nextErrors.pluralName = "Plural name is required.";
		if (!form.apiId.trim()) {
			nextErrors.apiId = "API ID is required.";
		} else if (!apiIdRegex.test(form.apiId.trim())) {
			nextErrors.apiId = "Use lowercase letters, numbers, and hyphens.";
		}

		const candidateFields = form.fields
			.map((field, index) => ({ field, index }))
			.filter(({ field }) => field.name.trim() || field.fieldName.trim());

		if (candidateFields.length === 0) {
			nextErrors.fields = "Add at least one field with a label and name.";
		}

		candidateFields.forEach(({ field, index }) => {
			const currentErrors: {
				name?: string;
				fieldName?: string;
				targetContentType?: string;
			} = {};
			if (!field.name.trim()) currentErrors.name = "Label is required.";
			if (!field.fieldName.trim()) {
				currentErrors.fieldName = "Field name is required.";
			} else if (!fieldNameRegex.test(field.fieldName.trim())) {
				currentErrors.fieldName =
					"Use letters, numbers, and underscores.";
			}
			if (field.type === "RELATION" && !field.targetContentType?.trim()) {
				currentErrors.targetContentType =
					"Target content type is required.";
			}
			if (Object.keys(currentErrors).length > 0) {
				fieldErrors[index] = currentErrors;
			}
		});

		if (Object.keys(fieldErrors).length > 0) {
			nextErrors.fieldErrors = fieldErrors;
		}

		setFormErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			toast.error("Fix the highlighted fields to continue.");
			return;
		}

		setLoading(true);
		try {
			const payload = {
				...form,
				fields: candidateFields.map(({ field }) => field),
			};
			await apiRequest<ContentTypeDto>("/api/content-types", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			toast.success("Content type created");
			setOpen(false);
			resetForm();
			loadContentTypes();
			window.dispatchEvent(new Event("apiforge:content-types"));
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to create content type",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await apiRequest(`/api/content-types/${id}`, { method: "DELETE" });
			toast.success("Content type deleted");
			loadContentTypes();
			window.dispatchEvent(new Event("apiforge:content-types"));
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to delete content type",
			);
		}
	};

	const typeNames = useMemo(() => {
		return contentTypes.map((type) => type.apiId);
	}, [contentTypes]);

	const filteredContentTypes = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return contentTypes;
		return contentTypes.filter((type) => {
			return (
				type.name.toLowerCase().includes(query) ||
				type.apiId.toLowerCase().includes(query) ||
				type.description?.toLowerCase().includes(query)
			);
		});
	}, [contentTypes, search]);

	const totalPages = Math.max(
		1,
		Math.ceil(filteredContentTypes.length / pageSize),
	);
	const pagedContentTypes = filteredContentTypes.slice(
		(page - 1) * pageSize,
		page * pageSize,
	);

	useEffect(() => {
		setPage(1);
	}, [search]);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="studio-heading">Content Types</p>
					<p className="text-sm text-muted-foreground">
						Define collection schemas that power your REST
						endpoints.
					</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Create Content Type</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[85vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>New Content Type</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid gap-3 md:grid-cols-2">
								<div className="space-y-1">
									<Input
										placeholder="Name"
										value={form.name}
										onChange={(event) => {
											setForm((prev) => ({
												...prev,
												name: event.target.value,
												apiId:
													prev.apiId ||
													slugify(event.target.value),
											}));
											setFormErrors((prev) => ({
												...prev,
												name: undefined,
											}));
										}}
									/>
									{formErrors.name && (
										<p className="text-xs text-destructive">
											{formErrors.name}
										</p>
									)}
								</div>
								<div className="space-y-1">
									<Input
										placeholder="Plural name"
										value={form.pluralName}
										onChange={(event) => {
											setForm((prev) => ({
												...prev,
												pluralName: event.target.value,
											}));
											setFormErrors((prev) => ({
												...prev,
												pluralName: undefined,
											}));
										}}
									/>
									{formErrors.pluralName && (
										<p className="text-xs text-destructive">
											{formErrors.pluralName}
										</p>
									)}
								</div>
								<div className="space-y-1 md:col-span-2">
									<Input
										placeholder="API ID (e.g. articles)"
										value={form.apiId}
										onChange={(event) => {
											setForm((prev) => ({
												...prev,
												apiId: event.target.value,
											}));
											setFormErrors((prev) => ({
												...prev,
												apiId: undefined,
											}));
										}}
									/>
									<div className="text-xs text-muted-foreground">
										Used in URLs. Lowercase letters,
										numbers, and hyphens only.
									</div>
									{formErrors.apiId && (
										<p className="text-xs text-destructive">
											{formErrors.apiId}
										</p>
									)}
								</div>
							</div>
							<Textarea
								placeholder="Explain what this content type is for"
								value={form.description}
								onChange={(event) =>
									setForm((prev) => ({
										...prev,
										description: event.target.value,
									}))
								}
							/>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold">
										Fields
									</p>
									<Button
										variant="secondary"
										size="sm"
										onClick={() =>
											setForm((prev) => ({
												...prev,
												fields: [
													...prev.fields,
													emptyField(),
												],
											}))
										}
									>
										Add Field
									</Button>
								</div>
								<div className="space-y-4">
									{form.fields.map((field, index) => (
										<div
											key={`field-${index}`}
											className="space-y-2"
										>
											<Card className="border border-border/60">
												<CardHeader className="flex flex-row items-center justify-between">
													<CardTitle className="text-sm">
														Field {index + 1}
													</CardTitle>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															removeField(index)
														}
													>
														Remove
													</Button>
												</CardHeader>
												<CardContent className="space-y-3">
													<div className="grid gap-3 md:grid-cols-2">
														<div className="space-y-1">
															<Input
																placeholder="Label"
																value={
																	field.name
																}
																onChange={(
																	event,
																) =>
																	handleFieldChange(
																		index,
																		"name",
																		event
																			.target
																			.value,
																	)
																}
															/>
															{formErrors
																.fieldErrors?.[
																index
															]?.name && (
																<p className="text-xs text-destructive">
																	{
																		formErrors
																			.fieldErrors?.[
																			index
																		]?.name
																	}
																</p>
															)}
														</div>
														<div className="space-y-1">
															<Input
																placeholder="Field name"
																value={
																	field.fieldName
																}
																onChange={(
																	event,
																) =>
																	handleFieldChange(
																		index,
																		"fieldName",
																		event
																			.target
																			.value,
																	)
																}
															/>
															{formErrors
																.fieldErrors?.[
																index
															]?.fieldName && (
																<p className="text-xs text-destructive">
																	{
																		formErrors
																			.fieldErrors?.[
																			index
																		]
																			?.fieldName
																	}
																</p>
															)}
														</div>
														<Select
															value={field.type}
															onValueChange={(
																value,
															) =>
																handleFieldChange(
																	index,
																	"type",
																	value as FieldType,
																)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Type" />
															</SelectTrigger>
															<SelectContent>
																{FIELD_TYPES.map(
																	(type) => (
																		<SelectItem
																			key={
																				type
																			}
																			value={
																				type
																			}
																		>
																			{
																				type
																			}
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
														<div className="space-y-1">
															<Input
																placeholder="Target content type"
																value={
																	field.targetContentType ??
																	""
																}
																onChange={(
																	event,
																) =>
																	handleFieldChange(
																		index,
																		"targetContentType",
																		event
																			.target
																			.value,
																	)
																}
																disabled={
																	field.type !==
																	"RELATION"
																}
															/>
															{formErrors
																.fieldErrors?.[
																index
															]
																?.targetContentType && (
																<p className="text-xs text-destructive">
																	{
																		formErrors
																			.fieldErrors?.[
																			index
																		]
																			?.targetContentType
																	}
																</p>
															)}
														</div>
														<Select
															value={
																field.relationType ??
																"ONE_TO_ONE"
															}
															onValueChange={(
																value,
															) =>
																handleFieldChange(
																	index,
																	"relationType",
																	value,
																)
															}
															disabled={
																field.type !==
																"RELATION"
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Relation type" />
															</SelectTrigger>
															<SelectContent>
																{RELATION_TYPES.map(
																	(type) => (
																		<SelectItem
																			key={
																				type
																			}
																			value={
																				type
																			}
																		>
																			{
																				type
																			}
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
													</div>
													<div className="flex flex-wrap gap-4">
														<label className="flex items-center gap-2 text-xs text-muted-foreground">
															<Checkbox
																checked={Boolean(
																	field.required,
																)}
																onCheckedChange={(
																	checked,
																) =>
																	handleFieldChange(
																		index,
																		"required",
																		Boolean(
																			checked,
																		),
																	)
																}
															/>
															Required
														</label>
														<label className="flex items-center gap-2 text-xs text-muted-foreground">
															<Checkbox
																checked={Boolean(
																	field.unique,
																)}
																onCheckedChange={(
																	checked,
																) =>
																	handleFieldChange(
																		index,
																		"unique",
																		Boolean(
																			checked,
																		),
																	)
																}
															/>
															Unique
														</label>
													</div>
												</CardContent>
											</Card>
										</div>
									))}
								</div>
								{formErrors.fields && (
									<p className="text-xs text-destructive">
										{formErrors.fields}
									</p>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="ghost"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button onClick={handleCreate} disabled={loading}>
								{loading ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>Existing Content Types</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Input
							placeholder="Search by name, API ID, or description"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="w-full sm:max-w-sm"
						/>
						<div className="text-xs text-muted-foreground">
							Showing {filteredContentTypes.length} result
							{filteredContentTypes.length === 1 ? "" : "s"}
						</div>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>API ID</TableHead>
								<TableHead>Fields</TableHead>
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
										<TableCell colSpan={5}>
											<div className="h-4 w-3/4 rounded bg-muted/40" />
										</TableCell>
									</TableRow>
								))}
							{!isLoading &&
								pagedContentTypes.map((type) => (
									<TableRow key={type.id}>
										<TableCell className="font-medium">
											{type.name}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">
												{type.apiId}
											</Badge>
										</TableCell>
										<TableCell>
											{type.fields?.length ?? 0}
										</TableCell>
										<TableCell>
											{formatDate(type.updatedAt)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-end gap-2">
												<Button
													asChild
													variant="ghost"
													size="sm"
												>
													<Link
														href={`/content/${type.apiId}`}
													>
														Open
													</Link>
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="destructive"
															size="sm"
														>
															Delete
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete{" "}
																{type.name}?
															</AlertDialogTitle>
															<AlertDialogDescription>
																This removes the
																schema and the
																dynamic table
																associated with
																it. This action
																cannot be
																undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDelete(
																		type.id,
																	)
																}
															>
																Confirm delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))}
							{!isLoading &&
								filteredContentTypes.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center text-sm text-muted-foreground"
										>
											No content types created yet.
										</TableCell>
									</TableRow>
								)}
						</TableBody>
					</Table>
					<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
						<div>
							Page {page} of {totalPages}
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
					<div className="mt-4 text-xs text-muted-foreground">
						Content types available:{" "}
						{typeNames.join(", ") || "None"}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
