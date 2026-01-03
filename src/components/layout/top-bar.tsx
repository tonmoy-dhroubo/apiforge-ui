"use client";

import Link from "next/link";
import { LogOut, Menu, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ContentTypeDto } from "@/lib/types";

const MOBILE_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/content-types", label: "Content Types" },
  { href: "/media", label: "Media" },
  { href: "/permissions", label: "Permissions" },
  { href: "/users", label: "Users" },
];

export function TopBar({
  title,
  user,
  contentTypes,
  loading,
  onLogout,
}: {
  title: string;
  user: Record<string, unknown> | null;
  contentTypes: ContentTypeDto[];
  loading: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar">
              <SheetHeader>
                <SheetTitle>ApiForge Studio</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <nav className="space-y-2">
                  {MOBILE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <Separator className="bg-sidebar-border" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                    Collections
                    <Badge variant="secondary" className="bg-sidebar-accent/60">
                      {loading ? "..." : contentTypes.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {contentTypes.map((type) => (
                      <Link
                        key={type.apiId}
                        href={`/content/${type.apiId}`}
                        className="block rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              ApiForge
            </p>
            <h2 className="text-lg font-semibold text-foreground lg:text-xl">
              {title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm text-muted-foreground md:block">
            <p className="text-xs uppercase tracking-[0.2em]">Signed in</p>
            <p className="font-medium text-foreground">
              {user?.username ? String(user.username) : "Administrator"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <Button variant="secondary" className="hidden md:inline-flex" onClick={onLogout}>
            Logout
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
