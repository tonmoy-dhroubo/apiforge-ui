"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { clearAuthToken, getAuthToken, getAuthUser } from "@/lib/auth";
import { ContentTypeDto } from "@/lib/types";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/content-types": "Content Type Builder",
  "/media": "Media Library",
  "/permissions": "Permissions",
  "/users": "Users & Roles",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [contentTypes, setContentTypes] = useState<ContentTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  const title = useMemo(() => {
    if (pathname?.startsWith("/content/")) return "Content Manager";
    return PAGE_TITLES[pathname ?? "/"] ?? "ApiForge Studio";
  }, [pathname]);

  const loadContentTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ContentTypeDto[]>("/api/content-types");
      setContentTypes(data ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load content types"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    loadContentTypes();
  }, [loadContentTypes, router]);

  useEffect(() => {
    const handler = () => loadContentTypes();
    window.addEventListener("apiforge:content-types", handler);
    return () => window.removeEventListener("apiforge:content-types", handler);
  }, [loadContentTypes]);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  return (
    <div className="studio-shell flex min-h-screen w-full">
      <Sidebar contentTypes={contentTypes} loading={loading} />
      <div className="flex flex-1 flex-col">
        <TopBar
          title={title}
          user={user}
          contentTypes={contentTypes}
          loading={loading}
          onLogout={() => {
            clearAuthToken();
            router.push("/login");
          }}
        />
        <main className="flex-1 px-6 pb-12 pt-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
