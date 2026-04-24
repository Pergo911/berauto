import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("Auth.registerPage");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-6 text-center text-sm">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-4"
          >
            {t("signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
