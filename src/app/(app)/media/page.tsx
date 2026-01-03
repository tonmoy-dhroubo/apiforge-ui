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

export default function MediaPage() {
  const [media, setMedia] = useState<MediaDto[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadMedia = useCallback(async () => {
    try {
      const data = await apiMediaRequest<MediaDto[]>("/api/upload");
      setMedia(data ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load media"
      );
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("files", file);
      await apiMediaRequest<MediaDto>("/api/upload", {
        method: "POST",
        body,
      });
      toast.success("File uploaded");
      setFile(null);
      loadMedia();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed"
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
        error instanceof Error ? error.message : "Delete failed"
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Upload Asset</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            type="file"
            onChange={(event) =>
              setFile(event.target.files ? event.target.files[0] : null)
            }
          />
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Uploads are sent to the media service directly at
            <span className="font-mono"> {MEDIA_BASE_URL}</span>.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {media.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/70 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.mime} - {humanFileSize(asset.size ?? undefined)}
                  </p>
                </div>
                <Badge variant="secondary">#{asset.id}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Stored as {asset.hash}{asset.ext}</p>
                <p>Provider: {asset.provider}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={`${MEDIA_BASE_URL}/api/upload/files/${asset.hash}${asset.ext}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open File
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
          {media.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
              No assets uploaded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
