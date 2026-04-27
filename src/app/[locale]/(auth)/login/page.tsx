import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const t = await getTranslations("Auth.loginPage");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          <Link
            href="/forgot-password"
            className="font-medium underline underline-offset-4"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="mt-6 text-center text-sm">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium underline underline-offset-4"
          >
            {t("register")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
