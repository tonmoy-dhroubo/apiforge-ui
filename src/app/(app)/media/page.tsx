"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiMediaRequest, MEDIA_BASE_URL } from "@/lib/api";
import { MediaDto } from "@/lib/types";
import { humanFileSize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpinnerEmpty } from "@/components/spinner-empty";

export default function MediaPage() {
	const [media, setMedia] = useState<MediaDto[]>([]);
	const [files, setFiles] = useState<File[]>([]);
	const [uploadStatus, setUploadStatus] = useState<
		Record<string, "pending" | "uploading" | "done" | "error">
	>({});
	const [uploading, setUploading] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const buildFileKey = (file: File) =>
		`${file.name}-${file.size}-${file.lastModified}`;

	const loadMedia = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await apiMediaRequest<MediaDto[]>("/api/upload");
			setMedia(data ?? []);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to load media",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadMedia();
	}, [loadMedia]);

	const handleUpload = async () => {
		if (!files.length) return;
		setUploading(true);
		const initialStatus: Record<
			string,
			"pending" | "uploading" | "done" | "error"
		> = {};
		files.forEach((file) => {
			initialStatus[buildFileKey(file)] = "pending";
		});
		setUploadStatus(initialStatus);
		let successCount = 0;
		let errorCount = 0;
		const failedFiles: File[] = [];
		try {
			for (const file of files) {
				const key = buildFileKey(file);
				setUploadStatus((prev) => ({ ...prev, [key]: "uploading" }));
				try {
					const body = new FormData();
					body.append("files", file);
					await apiMediaRequest<MediaDto>("/api/upload", {
						method: "POST",
						body,
					});
					successCount += 1;
					setUploadStatus((prev) => ({ ...prev, [key]: "done" }));
				} catch {
					errorCount += 1;
					failedFiles.push(file);
					setUploadStatus((prev) => ({ ...prev, [key]: "error" }));
				}
			}
			if (successCount > 0) {
				toast.success(
					`Uploaded ${successCount} file${successCount === 1 ? "" : "s"}.`,
				);
			}
			if (errorCount > 0) {
				toast.error(
					`Failed to upload ${errorCount} file${errorCount === 1 ? "" : "s"}.`,
				);
			}
			setFiles(failedFiles);
			loadMedia();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Upload failed",
			);
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await apiMediaRequest(`/api/upload/${id}`, { method: "DELETE" });
			toast.success("File deleted");
			loadMedia();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Delete failed",
			);
		}
	};

	return (
		<div className="space-y-6">
			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>Upload Asset</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<Input
							type="file"
							multiple
							onChange={(event) => {
								setFiles(
									event.target.files
										? Array.from(event.target.files)
										: [],
								);
								setUploadStatus({});
							}}
						/>
						<Button
							onClick={handleUpload}
							disabled={files.length === 0 || uploading}
							className="w-full md:w-auto"
						>
							{uploading
								? "Uploading..."
								: files.length === 1
									? "Upload file"
									: `Upload ${files.length} files`}
						</Button>
						<p className="text-xs text-muted-foreground">
							Uploads are sent to the media service directly at
							<span className="font-mono"> {MEDIA_BASE_URL}</span>
							.
						</p>
					</div>
					{files.length > 0 && (
						<div className="space-y-2 rounded-xl border border-border/60 bg-background/70 p-4 text-xs text-muted-foreground">
							<p className="text-sm font-semibold text-foreground">
								Selected files
							</p>
							{files.map((file) => {
								const key = buildFileKey(file);
								const status = uploadStatus[key];
								return (
									<div
										key={key}
										className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
									>
										<div>
											<p className="font-medium text-foreground">
												{file.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{humanFileSize(file.size)}
											</p>
										</div>
										<div className="flex items-center gap-2">
											{status && (
												<span>
													{status === "uploading" &&
														"Uploading"}
													{status === "done" &&
														"Uploaded"}
													{status === "error" &&
														"Failed"}
													{status === "pending" &&
														"Pending"}
												</span>
											)}
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													setFiles((prev) =>
														prev.filter(
															(item) =>
																item !== file,
														),
													)
												}
												disabled={uploading}
											>
												Remove
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>Library</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{isLoading && <SpinnerEmpty className="col-span-full" />}
					{!isLoading &&
						media.map((asset) => (
							<div
								key={asset.id}
								className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/70 p-4"
							>
								{asset.mime?.startsWith("image/") && (
									<div className="overflow-hidden rounded-lg border border-border/60">
										<img
											src={`${MEDIA_BASE_URL}/api/upload/files/${asset.hash}${asset.ext}`}
											alt={
												asset.alternativeText ??
												asset.name
											}
											className="h-40 w-full object-cover"
											loading="lazy"
										/>
									</div>
								)}
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="font-medium">
											{asset.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{asset.mime} -{" "}
											{humanFileSize(
												asset.size ?? undefined,
											)}
										</p>
									</div>
									<Badge variant="secondary">
										#{asset.id}
									</Badge>
								</div>
								<div className="text-xs text-muted-foreground">
									<p>
										Stored as {asset.hash}
										{asset.ext}
									</p>
									<p>Provider: {asset.provider}</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Button variant="outline" size="sm" asChild>
										<a
											href={`${MEDIA_BASE_URL}/api/upload/files/${asset.hash}${asset.ext}`}
											download={asset.name ?? undefined}
										>
											Download
										</a>
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDelete(asset.id)}
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					{!isLoading && media.length === 0 && (
						<div className="col-span-full rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
							No assets uploaded yet.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
