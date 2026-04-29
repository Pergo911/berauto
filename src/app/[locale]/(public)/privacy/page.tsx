import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPolicy" });
  return { title: `${t("title")} – BerAuto` };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("PrivacyPolicy");

  const sections = [
    "intro",
    "controller",
    "dataCollected",
    "purposes",
    "retention",
    "sharing",
    "security",
    "rights",
    "cookies",
    "contact",
    "changes",
  ] as const;

  const sectionsWithLists = new Set([
    "dataCollected",
    "purposes",
    "sharing",
    "rights",
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backHome")}
        </Link>

        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section} className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                {t(`sections.${section}.title`)}
              </h2>

              {sectionsWithLists.has(section) ? (
                <>
                  <p className="leading-7 text-muted-foreground">
                    {t(`sections.${section}.intro`)}
                  </p>
                  <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                    {(t.raw(`sections.${section}.items`) as string[]).map(
                      (item, i) => (
                        <li key={i} className="leading-7">
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  {section === "rights" && (
                    <p className="leading-7 text-muted-foreground">
                      {t("sections.rights.complaint")}
                    </p>
                  )}
                </>
              ) : (
                <p className="leading-7 text-muted-foreground">
                  {t(`sections.${section}.content`)}
                </p>
              )}
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>BerAuto &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
