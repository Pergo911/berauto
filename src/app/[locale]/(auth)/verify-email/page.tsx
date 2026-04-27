"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const t = useTranslations("Auth.verifyEmailPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "POST",
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          toast.success(t("successMessage"));
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          toast.error(data.error || t("errorMessage"));
        }
      } catch {
        setStatus("error");
        toast.error(t("errorMessage"));
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router, t]);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription className="text-destructive">
            {t("noTokenMessage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push("/login")}>{t("backToLogin")}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {status === "verifying" && t("verifyingMessage")}
          {status === "success" && t("successMessage")}
          {status === "error" && t("errorMessage")}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm text-muted-foreground">{t("processing")}</p>
          </div>
        ) : (
          <Button onClick={() => router.push("/login")}>{t("backToLogin")}</Button>
        )}
      </CardContent>
    </Card>
  );
}