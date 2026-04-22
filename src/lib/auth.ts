import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import {eq} from 'drizzle-orm';

import {db} from '@/db';
import {users} from '@/db/schema';

import type {UserRole} from '@/types';
import {routing} from '@/i18n/routing';

declare module 'next-auth' {
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

declare module 'next-auth' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

function getLocaleFromPath(pathname: string) {
  const segment = pathname.split('/')[1];
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale;
}

function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPath(pathname);
  const prefixed = `/${locale}`;

  if (pathname === prefixed) return '/';
  if (pathname.startsWith(`${prefixed}/`)) {
    return pathname.slice(prefixed.length);
  }

  return pathname;
}

function localizedPath(path: string, locale: string) {
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

export const {handlers, signIn, signOut, auth} = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {label: 'Email', type: 'email'},
        password: {label: 'Password', type: 'password'},
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

        if (!user) {
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
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({session, token}) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
    async authorized({auth, request: {nextUrl}}) {
      const isLoggedIn = !!auth?.user;
      const locale = getLocaleFromPath(nextUrl.pathname);
      const path = stripLocalePrefix(nextUrl.pathname);

      const loginUrl = localizedPath('/login', locale);

      if (path.startsWith('/agent')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(loginUrl, nextUrl));
        }

        return auth.user.role === 'agent' || auth.user.role === 'admin';
      }

      if (path.startsWith('/admin')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(loginUrl, nextUrl));
        }

        return auth.user.role === 'admin';
      }

      if (path.startsWith('/dashboard')) {
        if (!isLoggedIn) {
          return Response.redirect(new URL(loginUrl, nextUrl));
        }

        return true;
      }

      if (path.startsWith('/login') || path.startsWith('/register')) {
        if (isLoggedIn) {
          const role = auth.user.role;
          if (role === 'admin') {
            return Response.redirect(
              new URL(localizedPath('/admin', locale), nextUrl)
            );
          }
          if (role === 'agent') {
            return Response.redirect(
              new URL(localizedPath('/agent', locale), nextUrl)
            );
          }
          return Response.redirect(
            new URL(localizedPath('/dashboard', locale), nextUrl)
          );
        }
        return true;
      }

      return true;
    },
  },
});
