"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Phone, MapPin, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useMemo } from "react";

import { userSettingsSchema, type UserSettingsInput } from "@/lib/validations/users";
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
  initialPhone?: string | null;
  initialAddress?: string | null;
  onSuccess?: () => void;
}

export function UserSettingsForm({
  initialPhone = "",
  initialAddress = "",
  onSuccess,
}: UserSettingsFormProps) {
  const t = useTranslations("Profile.Settings");
  const router = useRouter();

  const form = useForm<UserSettingsInput>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      phone: initialPhone ?? "",
      address: initialAddress ?? "",
    },
  });

  const password = form.watch("password");
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { label: "very-weak", color: "text-red-500" },
      { label: "weak", color: "text-orange-500" },
      { label: "fair", color: "text-yellow-500" },
      { label: "good", color: "text-lime-500" },
      { label: "strong", color: "text-green-500" },
    ];
    const index = Math.min(Math.floor(score / 1.2), 4);
    return { score, ...levels[index] };
  }, [password]);

  async function onSubmit(values: UserSettingsInput) {
    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: values.password,
          confirmPassword: values.confirmPassword,
          phone: values.phone,
          address: values.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error || t("errors.generic")
        );
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info Card */}
        <div className="bg-black/50 border border-white/10 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-muted-foreground">{t("phoneLabel")}</FormLabel>
                  <FormControl className="relative">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="+1234567890"
                        autoComplete="tel"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-muted-foreground">{t("addressLabel")}</FormLabel>
                  <FormControl className="relative">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="123 Main St, City"
                        autoComplete="street-address"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-black/50 border border-white/10 rounded-lg p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-foreground">{t("passwordSection")}</h3>
          <div className="space-y-4">
             <FormField
               control={form.control}
               name="password"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-sm font-medium text-muted-foreground">{t("newPasswordLabel")}</FormLabel>
                   <FormControl className="relative">
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         type="password"
                         placeholder="••••••••"
                         autoComplete="new-password"
                         className="pl-9"
                         {...field}
                       />
                     </div>
                   </FormControl>
                   <FormMessage />
                   {password && (
                     <p className={`text-xs ${passwordStrength.color}`}>
                       {t(`passwordStrength.${passwordStrength.label}`, { 
                         defaultValue: passwordStrength.label 
                       })}
                     </p>
                   )}
                 </FormItem>
               )}
             />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-muted-foreground">{t("confirmPasswordLabel")}</FormLabel>
                  <FormControl className="relative">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 border border-green-600 hover:border-green-700 text-white font-medium px-6 py-2.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t("submit")}
        </Button>
      </form>
    </Form>
  );
}