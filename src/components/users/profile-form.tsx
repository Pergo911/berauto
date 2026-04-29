"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  updateOwnProfileSchema,
  type UpdateOwnProfileInput,
} from "@/lib/validations/users";
import { updateOwnProfile } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ProfileFormProps = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

export function ProfileForm({ name, email, phone, address }: ProfileFormProps) {
  const t = useTranslations("Profile");

  const form = useForm<UpdateOwnProfileInput>({
    resolver: zodResolver(updateOwnProfileSchema),
    defaultValues: {
      name,
      phone: phone ?? "",
      address: address ?? "",
    },
  });

  async function onSubmit(values: UpdateOwnProfileInput) {
    const result = await updateOwnProfile(values);

    if (!result.success) {
      toast.error(t("toastError"));
      return;
    }

    toast.success(t("toastSaved"));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {t("emailLabel")}
          </p>
          <p className="text-sm">{email}</p>
          <p className="text-xs text-muted-foreground">{t("emailNote")}</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phoneLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  {...field}
                  value={field.value ?? ""}
                />
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
              <FormControl>
                <Textarea
                  placeholder={t("addressPlaceholder")}
                  className="min-h-20 resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {form.formState.isSubmitting ? t("saving") : t("saveButton")}
        </Button>
      </form>
    </Form>
  );
}
