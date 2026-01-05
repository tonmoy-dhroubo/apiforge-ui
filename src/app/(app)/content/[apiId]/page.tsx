"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { apiMediaRequest, apiRequest } from "@/lib/api";
import { ContentEntry, ContentTypeDto, FieldDto, MediaDto } from "@/lib/types";
import { formatDate, truncateMiddle } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { SpinnerEmpty } from "@/components/spinner-empty";

export default function ContentEntriesPage() {
  const params = useParams();
  const apiId = String(params.apiId || "");
  const [contentType, setContentType] = useState<ContentTypeDto | null>(null);
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [media, setMedia] = useState<MediaDto[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [typeData, entryData, mediaData] = await Promise.all([
        apiRequest<ContentTypeDto>(`/api/content-types/api-id/${apiId}`),
        apiRequest<ContentEntry[]>(`/api/content/${apiId}`),
        apiMediaRequest<MediaDto[]>("/api/upload"),
      ]);
      setContentType(typeData ?? null);
      setEntries(entryData ?? []);
      setMedia(mediaData ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load content"
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

  const handleValueChange = (field: FieldDto, value: unknown) => {
    setForm((prev) => ({ ...prev, [field.fieldName]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiRequest(`/api/content/${apiId}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Entry created");
      setForm({});
      loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create entry"
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
        error instanceof Error ? error.message : "Unable to delete entry"
      );
    }
  };

  const visibleFields = useMemo(() => {
    return (contentType?.fields ?? []).slice(0, 3);
  }, [contentType]);

  const renderField = (field: FieldDto) => {
    const value = form[field.fieldName];
    switch (field.type) {
      case "LONG_TEXT":
      case "RICH_TEXT":
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(event) =>
              handleValueChange(field, event.target.value)
            }
            placeholder={field.name}
          />
        );
      case "NUMBER":
        return (
          <Input
            type="number"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(event) => {
              const raw = event.target.value;
              handleValueChange(field, raw === "" ? null : Number(raw));
            }}
          />
        );
      case "BOOLEAN":
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleValueChange(field, checked)}
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
            onValueChange={(val) => handleValueChange(field, Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select media" />
            </SelectTrigger>
            <SelectContent>
              {media.map((asset) => (
                <SelectItem key={asset.id} value={String(asset.id)}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "RELATION":
        return (
          <Input
            type="number"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(event) => {
              const raw = event.target.value;
              handleValueChange(field, raw === "" ? null : Number(raw));
            }}
            placeholder={`Related ${field.targetContentType ?? "id"}`}
          />
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
              <CardTitle>{contentType?.name ?? "Content"}</CardTitle>
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
                <div key={field.fieldName} className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {field.name}
                  </label>
                  {renderField(field)}
                  {field.type === "MEDIA" && media.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No media available. <Link href="/media" className="underline">Upload assets</Link>.
                    </p>
                  )}
                  {field.type === "RELATION" && (
                    <p className="text-xs text-muted-foreground">
                      Provide the related entry ID for {field.targetContentType ?? "collection"}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
              No fields defined yet. Add fields in the content type builder.
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Create Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {visibleFields.map((field) => (
                  <TableHead key={field.fieldName}>{field.name}</TableHead>
                ))}
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={visibleFields.length + 3}
                    className="py-6"
                  >
                    <SpinnerEmpty />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                entries.map((entry) => (
                  <TableRow key={String(entry.id)}>
                    <TableCell className="font-medium">
                      {String(entry.id ?? "-")}
                    </TableCell>
                    {visibleFields.map((field) => (
                      <TableCell key={field.fieldName}>
                        {entry[field.fieldName]
                          ? truncateMiddle(String(entry[field.fieldName]))
                          : "-"}
                      </TableCell>
                    ))}
                    <TableCell>
                      {formatDate(entry.updated_at as string | undefined)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Entry {String(entry.id)}</DialogTitle>
                            </DialogHeader>
                            <pre className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
                              {JSON.stringify(entry, null, 2)}
                            </pre>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(Number(entry.id))}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={visibleFields.length + 3}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No entries yet.
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
