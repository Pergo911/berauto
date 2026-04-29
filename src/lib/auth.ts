import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { env } from "@/lib/env";

import type { UserRole } from "@/types";
import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

function getLocaleFromPath(pathname: string) {
  if (!pathname || pathname === "/") {
    return routing.defaultLocale;
  }

  const segment = pathname.split("/")[1];

  if (!segment) {
    return routing.defaultLocale;
  }

  return hasLocale(routing.locales, segment) ? segment : routing.defaultLocale;
}

function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPath(pathname);
  const prefixed = `/${locale}`;

  if (pathname === prefixed) return "/";
  if (pathname.startsWith(`${prefixed}/`)) {
    return pathname.slice(prefixed.length);
  }

  return pathname;
}

function localizedPath(path: string, locale: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

const oauthProviders = [];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
  oauthProviders.push(
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    ...oauthProviders,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) return false;

        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (!existing) {
          await db.insert(users).values({
            email: user.email,
            name: user.name ?? user.email.split("@")[0],
            passwordHash: null,
            role: "user",
            emailVerified: true,
          });
        } else if (!existing.emailVerified) {
          // Auto-verify OAuth users who previously registered via credentials
          await db
            .update(users)
            .set({ emailVerified: true })
            .where(eq(users.id, existing.id));
        }

        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" || account?.provider === "github") {
          // OAuth: user object comes from the provider profile — look up our DB
          // record to get the correct UUID and role that were set in signIn.
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } else {
          // Credentials: user is returned directly from authorize()
          token.id = user.id as string;
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const locale = getLocaleFromPath(nextUrl.pathname);
      const path = stripLocalePrefix(nextUrl.pathname);

      const loginUrl = localizedPath("/login", locale);

      if (path.startsWith("/agent")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(loginUrl, nextUrl));
        }

        return auth.user.role === "agent" || auth.user.role === "admin";
      }

      if (path.startsWith("/admin")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(loginUrl, nextUrl));
        }

        return auth.user.role === "admin";
      }

      if (path.startsWith("/dashboard")) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(loginUrl, nextUrl));
        }

        return true;
      }

      if (path.startsWith("/login") || path.startsWith("/register")) {
        if (isLoggedIn) {
          const role = auth.user.role;
          if (role === "admin") {
            return Response.redirect(
              new URL(localizedPath("/admin", locale), nextUrl)
            );
          }
          if (role === "agent") {
            return Response.redirect(
              new URL(localizedPath("/agent", locale), nextUrl)
            );
          }
          return Response.redirect(
            new URL(localizedPath("/dashboard", locale), nextUrl)
          );
        }
        return true;
      }

      return true;
    },
  },
});
