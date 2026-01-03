"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FileText,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ContentTypeDto } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/content-types", label: "Content Types", icon: Boxes },
  { href: "/media", label: "Media Library", icon: FolderKanban },
  { href: "/permissions", label: "Permissions", icon: ShieldCheck },
  { href: "/users", label: "Users", icon: Users },
];

export function Sidebar({
  contentTypes,
  loading,
}: {
  contentTypes: ContentTypeDto[];
  loading: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            ApiForge
          </p>
          <h1 className="text-lg font-semibold">Studio</h1>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
              Core
            </p>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                Collections
              </p>
              <Badge variant="secondary" className="bg-sidebar-accent/70">
                {loading ? "..." : contentTypes.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {contentTypes.length === 0 && !loading && (
                <div className="rounded-xl border border-dashed border-sidebar-border px-3 py-3 text-xs text-sidebar-foreground/60">
                  No content types yet. Create one to unlock collections.
                </div>
              )}
              {contentTypes.map((type) => (
                <Link
                  key={type.apiId}
                  href={`/content/${type.apiId}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    pathname === `/content/${type.apiId}` &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span className="flex-1 truncate">{type.name}</span>
                  <Badge
                    variant="secondary"
                    className="bg-sidebar-primary/20 text-sidebar-foreground"
                  >
                    {type.fields?.length ?? 0}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
