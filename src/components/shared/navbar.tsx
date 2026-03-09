import type { Panel, NavbarUser } from "@/components/shared/navbar-client";

import { auth } from "@/lib/auth";
import { NavbarClient } from "@/components/shared/navbar-client";

type NavbarProps = {
  panel?: Panel;
  hideLogin?: boolean;
};

export async function Navbar({
  panel = "public",
  hideLogin = false,
}: NavbarProps) {
  const session = await auth();

  const user: NavbarUser | null = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  return <NavbarClient panel={panel} user={user} hideLogin={hideLogin} />;
}
