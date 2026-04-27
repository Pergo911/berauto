/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { USER_ROLE } from "@/types";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const t = useTranslations("Auth.forms");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("errors.invalidCredentials"));
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      if (role === USER_ROLE.ADMIN) {
        router.push("/admin");
      } else if (role === USER_ROLE.AGENT) {
        router.push("/agent");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    }
  }

  return (
    <div className="grid gap-6">
      {error === "Please verify your email before logging in" && (
        <Alert>
          <AlertDescription>
            <p className="mb-2">Your email address is not verified.</p>
            <Button
              variant="link"
              className="p-0 h-auto"
              asChild
            >
              <Link href="/verify-email">Resend verification email</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("passwordLabel")}</FormLabel>
              <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="animate-spin" />
            )}
            {t("signIn")}
          </Button>
        </form>
      </Form>
      <SocialButtons />
    </div>
  );
}
