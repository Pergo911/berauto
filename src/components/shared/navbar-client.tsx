"use client";

import { useSyncExternalStore, useTransition, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Car,
  ChevronDown,
  ClipboardList,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Monitor,
  Sun,
  User,
  ShieldUser,
} from "lucide-react";

import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

// ---------- Types ----------

export type Panel = "public" | "dashboard" | "agent" | "admin";

export type NavbarUser = {
  name: string;
  email: string;
  role: UserRole;
};

export type NavbarClientProps = {
  panel: Panel;
  user: NavbarUser | null;
  hideLogin?: boolean;
};

type NavRoute = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type PanelOption = {
  label: string;
  value: Panel;
  href: string;
};

// ---------- Route Config ----------

// Home is always the first entry so it appears at the top of the dropdown.
// Public panel shows identical routes for every role (Home + Dashboard).
// Authenticated panel routes include Home so it is always reachable from the dropdown.
const PANEL_ROUTES: Record<Panel, NavRoute[]> = {
  public: [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ],
  dashboard: [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ],
  agent: [
    { label: "Home", href: "/", icon: Home },
    { label: "Overview", href: "/agent", icon: BarChart3 },
    { label: "Requests", href: "/agent/requests", icon: ClipboardList },
    { label: "Active Rentals", href: "/agent/active", icon: Car },
    { label: "Invoices", href: "/agent/invoices", icon: FileText },
  ],
  admin: [
    { label: "Home", href: "/", icon: Home },
    { label: "Overview", href: "/admin", icon: BarChart3 },
    { label: "Cars", href: "/admin/cars", icon: Car },
    { label: "Users", href: "/admin/users", icon: ShieldUser },
  ],
};

function getAvailablePanels(role: UserRole): PanelOption[] {
  switch (role) {
    case "admin":
      return [
        { label: "User Mode", value: "public", href: "/" },
        { label: "Agent Mode", value: "agent", href: "/agent" },
        { label: "Admin Mode", value: "admin", href: "/admin" },
      ];
    case "agent":
      return [
        { label: "User Mode", value: "public", href: "/" },
        { label: "Agent Mode", value: "agent", href: "/agent" },
      ];
    default:
      return [];
  }
}

const PANEL_LABELS: Record<Panel, string> = {
  public: "User Mode",
  dashboard: "User Mode",
  agent: "Agent Mode",
  admin: "Admin Mode",
};

// ---------- Helpers ----------

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// ---------- Sub-components ----------

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const currentTheme = mounted ? (theme ?? "system") : "system";

  return (
    <div className="px-2 py-1.5">
      <Tabs value={currentTheme} onValueChange={setTheme}>
        <TabsList className="w-full">
          <TabsTrigger value="light" className="flex-1">
            <Sun className="size-4" />
            <span className="sr-only">Light</span>
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex-1">
            <Moon className="size-4" />
            <span className="sr-only">Dark</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1">
            <Monitor className="size-4" />
            <span className="sr-only">System</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function PanelModeIcon({
  panel,
  className,
}: {
  panel: Panel;
  className?: string;
}) {
  if (panel === "admin") return <ShieldUser className={className} />;
  if (panel === "agent") return <ClipboardList className={className} />;
  return <User className={className} />;
}

function PanelSwitcher({
  panel,
  panels,
}: {
  panel: Panel;
  panels: PanelOption[];
}) {
  const [open, setOpen] = useState(false);
  const openedAt = useRef<number>(0);
  const router = useRouter();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) openedAt.current = Date.now();
  }

  if (panels.length === 0) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className="gap-1 text-muted-foreground"
        >
          <PanelModeIcon panel={panel} className="size-3.5" />
          {PANEL_LABELS[panel]}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {panels.map((p) => (
          <DropdownMenuItem
            key={p.value}
            className={cn(panel === p.value && "bg-accent")}
            onSelect={(e) => {
              if (Date.now() - openedAt.current < 300) {
                e.preventDefault();
                return;
              }
              router.push(p.href);
            }}
          >
            <PanelModeIcon panel={p.value} className="size-4" />
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------- Helpers ----------

function RoleIcon({ role, className }: { role: UserRole; className?: string }) {
  if (role === "admin") return <ShieldUser className={className} />;
  if (role === "agent") return <ClipboardList className={className} />;
  return <User className={className} />;
}

// ---------- Main Component ----------

export function NavbarClient({ panel, user, hideLogin }: NavbarClientProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const panels = user ? getAvailablePanels(user.role) : [];
  const showPanelSwitcher = panels.length > 1;

  // For logged-in users show context routes based on the current panel.
  const routes: NavRoute[] = user ? PANEL_ROUTES[panel] : [];

  // Exact match for "/" to avoid false positives on sub-routes.
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/40 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Panel Switcher */}
        <div className="flex items-center gap-1">
          <Link href="/" className="text-xl font-bold flex items-center gap-4">
            <Image
              src="/com-logo.png"
              alt="Company logo"
              width={42}
              height={42}
            />
            BerAuto
          </Link>
          {showPanelSwitcher && (
            <>
              <span className="mx-1 text-lg text-muted-foreground/40">/</span>
              {/* user is non-null here: showPanelSwitcher is only true when panels.length > 1,
                  which requires user to be defined (panels = user ? getAvailablePanels(...) : []) */}
              <PanelSwitcher panel={panel} panels={panels} />
            </>
          )}
        </div>

        {/* Right: Login (logged out) or Profile dropdown (logged in) */}
        <div className="flex items-center gap-2">
          {!user ? (
            !hideLogin && (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 size-4" />
                  Login
                </Button>
              </Link>
            )
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <RoleIcon role={user.role} className="size-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* User info */}
                <DropdownMenuLabel className="font-normal flex gap-2">
                  <RoleIcon role={user.role} className="size-4" />
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                {/* Navigation routes */}
                {routes.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {routes.map((route) => {
                        const Icon = route.icon;
                        const active = isActive(route.href);
                        return (
                          <DropdownMenuItem
                            key={route.href}
                            asChild
                            className={cn(
                              active &&
                                "bg-accent text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <Link href={route.href}>
                              <Icon className="size-4" />
                              {route.label}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator />

                {/* Theme switcher (icon-only tabs) */}
                <ThemeSwitcher />

                {/* Language (greyed out for future localization) */}
                <DropdownMenuItem disabled>
                  <Globe className="size-4" />
                  Language
                  <span className="ml-auto text-xs text-muted-foreground">
                    Soon
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Sign out */}
                <DropdownMenuItem
                  disabled={isPending}
                  onSelect={() => {
                    startTransition(() => signOutAction());
                  }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
