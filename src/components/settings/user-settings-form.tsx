"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Phone, MapPin, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

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
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phoneLabel")}</FormLabel>
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
                <FormLabel>{t("addressLabel")}</FormLabel>
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

        <div className="border-t pt-4">
          <h3 className="mb-4 text-base font-semibold">{t("passwordSection")}</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("newPasswordLabel")}</FormLabel>
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
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
          className="w-full bg-green-600 hover:bg-green-700 border border-green-600 hover:border-green-700 text-white font-medium px-6 py-2.5 rounded-md transition-all"
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