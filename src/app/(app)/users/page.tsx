"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { ROLE_OPTIONS } from "@/lib/constants";
import { UserDto } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
	const [users, setUsers] = useState<UserDto[]>([]);
	const [selected, setSelected] = useState<UserDto | null>(null);
	const [roles, setRoles] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const loadUsers = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await apiRequest<UserDto[]>("/api/auth/users");
			setUsers(data ?? []);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Unable to load users",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const openRoles = (user: UserDto) => {
		setSelected(user);
		setRoles(user.roles ?? []);
	};

	const saveRoles = async () => {
		if (!selected) return;
		try {
			await apiRequest(`/api/auth/users/${selected.id}/roles`, {
				method: "PUT",
				body: JSON.stringify({ roles }),
			});
			toast.success("Roles updated");
			setSelected(null);
			loadUsers();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Unable to update roles",
			);
		}
	};

	const filteredUsers = users.filter((user) => {
		const query = search.trim().toLowerCase();
		if (!query) return true;
		return (
			user.username.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			(user.roles ?? []).some((role) =>
				role.toLowerCase().includes(query),
			)
		);
	});

	const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
	const pagedUsers = filteredUsers.slice(
		(page - 1) * pageSize,
		page * pageSize,
	);

	useEffect(() => {
		setPage(1);
	}, [search]);

	return (
		<div className="space-y-6">
			<Card className="glass-panel">
				<CardHeader>
					<CardTitle>Users & Roles</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Input
							placeholder="Search by username, email, or role"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="w-full sm:max-w-sm"
						/>
						<div className="text-xs text-muted-foreground">
							{filteredUsers.length} user
							{filteredUsers.length === 1 ? "" : "s"}
						</div>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Roles</TableHead>
								<TableHead>Created</TableHead>
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
								pagedUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											{[user.firstname, user.lastname]
												.filter(Boolean)
												.join(" ") || user.username}
											<p className="text-xs text-muted-foreground">
												{user.username}
											</p>
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-2">
												{(user.roles ?? []).map(
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
										<TableCell>
											{formatDate(user.createdAt)}
										</TableCell>
										<TableCell className="text-right">
											<Dialog
												open={selected?.id === user.id}
												onOpenChange={(open) =>
													!open && setSelected(null)
												}
											>
												<DialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															openRoles(user)
														}
													>
														Edit roles
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>
															Update roles for{" "}
															{user.username}
														</DialogTitle>
													</DialogHeader>
													<div className="space-y-3">
														{ROLE_OPTIONS.map(
															(role) => (
																<label
																	key={role}
																	className="flex items-center gap-2 text-sm"
																>
																	<Checkbox
																		checked={roles.includes(
																			role,
																		)}
																		onCheckedChange={(
																			checked,
																		) => {
																			if (
																				checked
																			) {
																				setRoles(
																					(
																						prev,
																					) => [
																						...prev,
																						role,
																					],
																				);
																			} else {
																				setRoles(
																					(
																						prev,
																					) =>
																						prev.filter(
																							(
																								item,
																							) =>
																								item !==
																								role,
																						),
																				);
																			}
																		}}
																	/>
																	{role}
																</label>
															),
														)}
													</div>
													<DialogFooter>
														<Button
															variant="ghost"
															onClick={() =>
																setSelected(
																	null,
																)
															}
														>
															Cancel
														</Button>
														<Button
															onClick={saveRoles}
														>
															Save roles
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</TableCell>
									</TableRow>
								))}
							{!isLoading && filteredUsers.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center text-sm text-muted-foreground"
									>
										No users found.
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
				</CardContent>
			</Card>
		</div>
	);
}
