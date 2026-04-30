"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Phone, MapPin, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import {
  updateOwnProfileSchema,
  type UpdateOwnProfileInput,
} from "@/lib/validations/users";
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

export interface UserSettingsFormProps {
  initialName?: string | null;
  initialPhone?: string | null;
  initialAddress?: string | null;
  onSuccess?: () => void;
}

export function UserSettingsForm({
  initialName = "",
  initialPhone = "",
  initialAddress = "",
  onSuccess,
}: UserSettingsFormProps) {
  const t = useTranslations("Profile.Settings");
  const router = useRouter();

  const form = useForm<UpdateOwnProfileInput>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: {
      name: initialName ?? "",
      password: "",
      confirmPassword: "",
      phone: initialPhone ?? "",
      address: initialAddress ?? "",
    },
  });

  const password = useWatch({ control: form.control, name: "password" });
  const passwordStrength = (() => {
    if (!password) return { score: 0, color: "bg-green-600/30", label: "none" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { color: "bg-green-600/30", label: "very-weak" },
      { color: "bg-green-600/40", label: "weak" },
      { color: "bg-green-600/50", label: "fair" },
      { color: "bg-green-600/60", label: "good" },
      { color: "bg-green-600/80", label: "strong" },
      {
        color: "bg-gradient-to-r from-green-600 to-emerald-500",
        label: "very-strong",
      },
    ];
    return { score, ...levels[Math.min(score - 1, 5)] };
  })();

  function onInvalid() {
    toast.error(t("errors.generic"));
  }

  async function onSubmit(values: UpdateOwnProfileInput) {
    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          password: values.password,
          confirmPassword: values.confirmPassword,
          phone: values.phone,
          address: values.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || t("errors.generic"));
        return;
      }

      toast.success(t("success"));
      router.refresh();
      onSuccess?.();
    } catch {
      toast.error(t("errors.generic"));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
      >
        {/* Personal Info Card */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("personalInfo", { defaultValue: "Personal Information" })}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("personalInfoDesc", {
                defaultValue: "Update your contact details",
              })}
            </p>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("nameLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        placeholder={t("namePlaceholder")}
                        autoComplete="name"
                        className="h-11 pl-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("phoneLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        placeholder="+36 30 123 4567"
                        autoComplete="tel"
                        className="h-11 pl-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("addressLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        placeholder="1234 Budapest, Példa utca 10."
                        autoComplete="street-address"
                        className="h-11 pl-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Security Card */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("passwordSection")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("passwordSectionDesc", {
                defaultValue:
                  "Change your password to keep your account secure",
              })}
            </p>
          </div>
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("newPasswordLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className="h-11 pl-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                  {password && passwordStrength.label !== "none" && (
                    <div className="space-y-1.5 pt-1">
                      <div className="h-1 w-full bg-muted-60 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.score / 6) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>
                          {t(`passwordStrength.${passwordStrength.label}`, {
                            defaultValue: passwordStrength.label,
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {t("passwordHint", {
                            defaultValue:
                              "6+ characters with mix of letters, numbers & symbols",
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("confirmPasswordLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className="h-11 pl-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-green-500/50 hover:border-green-400 text-white font-medium px-6 py-2.5 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submit")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("submit")}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
