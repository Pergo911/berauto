import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    DATABASE_URL_UNPOOLED: z.url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_TRUST_HOST: z.string().default("true"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    UPLOADTHING_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["hu", "en"]).default("hu"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NODE_ENV: process.env.NODE_ENV,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
