"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.length >= 2) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="user-search">Search Users</Label>
      <Input
        id="user-search"
        type="search"
        placeholder="Search by name, email, or ID (min 2 characters)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
    </div>
  );
}
