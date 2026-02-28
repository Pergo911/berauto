"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type NavbarProps = {
  brand: ReactNode;
  children: ReactNode;
};

export function Navbar({ brand, children }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {brand}

        {/* Desktop nav — hidden below lg */}
        <nav className="hidden items-center gap-4 lg:flex">{children}</nav>

        {/* Mobile hamburger — visible below lg */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              {/* Close the sheet when any link/button inside is clicked */}
              <nav
                className="flex flex-col gap-3 px-4"
                onClick={() => setOpen(false)}
              >
                {children}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
