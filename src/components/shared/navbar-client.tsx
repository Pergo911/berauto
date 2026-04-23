"use client";

import { useSyncExternalStore, useTransition, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
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
import Image from "next/image";

import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
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
  labelKey: string;
  href: string;
  icon: LucideIcon;
};

type PanelOption = {
  labelKey: string;
  value: Panel;
  href: string;
};

const PANEL_ROUTES: Record<Panel, NavRoute[]> = {
  public: [
    { labelKey: "routes.home", href: "/", icon: Home },
    { labelKey: "routes.dashboard", href: "/dashboard", icon: LayoutDashboard },
  ],
  dashboard: [
    { labelKey: "routes.home", href: "/", icon: Home },
    { labelKey: "routes.dashboard", href: "/dashboard", icon: LayoutDashboard },
  ],
  agent: [
    { labelKey: "routes.home", href: "/", icon: Home },
    { labelKey: "routes.overview", href: "/agent", icon: BarChart3 },
    {
      labelKey: "routes.requests",
      href: "/agent/requests",
      icon: ClipboardList,
    },
    { labelKey: "routes.activeRentals", href: "/agent/active", icon: Car },
    { labelKey: "routes.invoices", href: "/agent/invoices", icon: FileText },
  ],
  admin: [
    { labelKey: "routes.home", href: "/", icon: Home },
    { labelKey: "routes.overview", href: "/admin", icon: BarChart3 },
    { labelKey: "routes.cars", href: "/admin/cars", icon: Car },
    { labelKey: "routes.users", href: "/admin/users", icon: ShieldUser },
  ],
};

function getAvailablePanels(role: UserRole): PanelOption[] {
  switch (role) {
    case "admin":
      return [
        { labelKey: "panel.userMode", value: "public", href: "/" },
        { labelKey: "panel.agentMode", value: "agent", href: "/agent" },
        { labelKey: "panel.adminMode", value: "admin", href: "/admin" },
      ];
    case "agent":
      return [
        { labelKey: "panel.userMode", value: "public", href: "/" },
        { labelKey: "panel.agentMode", value: "agent", href: "/agent" },
      ];
    default:
      return [];
  }
}

const PANEL_LABELS: Record<Panel, string> = {
  public: "panel.userMode",
  dashboard: "panel.userMode",
  agent: "panel.agentMode",
  admin: "panel.adminMode",
};

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function ThemeSwitcher() {
  const t = useTranslations("Navbar");
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const currentTheme = mounted ? (theme ?? "system") : "system";

  return (
    <div className="px-2 py-1.5">
      <Tabs value={currentTheme} onValueChange={setTheme}>
        <TabsList className="w-full">
          <TabsTrigger value="light" className="flex-1">
            <Sun className="size-4" />
            <span className="sr-only">{t("theme.light")}</span>
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex-1">
            <Moon className="size-4" />
            <span className="sr-only">{t("theme.dark")}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1">
            <Monitor className="size-4" />
            <span className="sr-only">{t("theme.system")}</span>
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
  const t = useTranslations("Navbar");
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
          {t(PANEL_LABELS[panel])}
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
            {t(p.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleIcon({ role, className }: { role: UserRole; className?: string }) {
  if (role === "admin") return <ShieldUser className={className} />;
  if (role === "agent") return <ClipboardList className={className} />;
  return <User className={className} />;
}

export function NavbarClient({ panel, user, hideLogin }: NavbarClientProps) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const panels = user ? getAvailablePanels(user.role) : [];
  const showPanelSwitcher = panels.length > 1;
  const routes: NavRoute[] = user ? PANEL_ROUTES[panel] : [];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/40 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Link href="/" className="text-xl font-bold flex items-center gap-4">
            <Image
              src="/com-logo.png"
              alt={t("companyLogoAlt")}
              width={42}
              height={42}
            />
            BerAuto
          </Link>
          {showPanelSwitcher && (
            <>
              <span className="mx-1 text-lg text-muted-foreground/40">/</span>
              <PanelSwitcher panel={panel} panels={panels} />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            !hideLogin && (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 size-4" />
                  {t("actions.login")}
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
                              {t(route.labelKey)}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator />

                <ThemeSwitcher />

                <DropdownMenuItem
                  onSelect={() => {
                    const nextLocale = locale === "hu" ? "en" : "hu";
                    router.replace(pathname, { locale: nextLocale });
                  }}
                >
                  <Globe className="size-4" />
                  {t("language.label")}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {t(
                      `language.${locale as (typeof routing.locales)[number]}`
                    )}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={isPending}
                  onSelect={() => {
                    startTransition(() => signOutAction());
                  }}
                >
                  <LogOut className="size-4" />
                  {t("actions.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
