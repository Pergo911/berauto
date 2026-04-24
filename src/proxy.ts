import createMiddleware from "next-intl/middleware";

import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default auth((request) => intlMiddleware(request));

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
