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
import { SpinnerEmpty } from "@/components/spinner-empty";
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

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<UserDto[]>("/api/auth/users");
      setUsers(data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load users");
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
      toast.error(error instanceof Error ? error.message : "Unable to update roles");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Users & Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6">
                    <SpinnerEmpty />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {[user.firstname, user.lastname].filter(Boolean).join(" ") ||
                        user.username}
                      <p className="text-xs text-muted-foreground">
                        {user.username}
                      </p>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {(user.roles ?? []).map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={selected?.id === user.id} onOpenChange={(open) => !open && setSelected(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => openRoles(user)}>
                            Edit roles
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update roles for {user.username}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            {ROLE_OPTIONS.map((role) => (
                              <label key={role} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={roles.includes(role)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setRoles((prev) => [...prev, role]);
                                    } else {
                                      setRoles((prev) => prev.filter((item) => item !== role));
                                    }
                                  }}
                                />
                                {role}
                              </label>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setSelected(null)}>
                              Cancel
                            </Button>
                            <Button onClick={saveRoles}>Save roles</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
