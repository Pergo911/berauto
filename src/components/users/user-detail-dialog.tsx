"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { Eye, Mail, Phone, MapPin, User } from "lucide-react";
import { toast } from "sonner";

import type { UserDTO } from "@/lib/data/users";
import type { UserRole } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { updateUser } from "@/actions/users";
import {
  updateUserSchema,
  type UpdateUserInput,
} from "@/lib/validations/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ── Role config ────────────────────────────────────────

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; className: string; activeClassName: string }
> = {
  user: {
    label: "User",
    className: "border-gray-300 dark:border-gray-600",
    activeClassName: "bg-gray-600 text-white border-gray-600",
  },
  agent: {
    label: "Agent",
    className: "border-blue-300 dark:border-blue-600",
    activeClassName: "bg-blue-600 text-white border-blue-600",
  },
  admin: {
    label: "Admin",
    className: "border-red-300 dark:border-red-600",
    activeClassName: "bg-red-600 text-white border-red-600",
  },
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-red-600 text-white",
  agent: "bg-blue-600 text-white",
  user: "bg-gray-600 text-white",
};

// ── Types ──────────────────────────────────────────────

type UserDetailDialogProps = {
  user: UserDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ── Main component ─────────────────────────────────────

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  const t = useTranslations("UserDetailDialog");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema) as Resolver<UpdateUserInput>,
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      address: user.address ?? "",
      role: user.role,
    },
  });

  // Reset form whenever the dialog opens or the selected user changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        address: user.address ?? "",
        role: user.role,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.id]);

  function onSubmit(data: UpdateUserInput) {
    startTransition(async () => {
      const result = await updateUser(user.id, data);
      if (result.success) {
        toast.success(t("toastUpdated"));
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  const selectedRole = form.watch("role") ?? user.role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5 text-muted-foreground" />
              {user.name}
            </DialogTitle>
            <Badge className={ROLE_BADGE_CLASSES[user.role]}>
              {t(`roles.${user.role}`)}
            </Badge>
          </div>
          <DialogDescription>
            {user.email} ·{" "}
            {t("joined", { date: formatDate(user.createdAt, locale) })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <User className="size-3" />
                      {t("formLabels.name")}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {t("formLabels.email")}
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {t("formLabels.phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("notProvided")}
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
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {t("formLabels.address")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("notProvided")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Role Selector */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("formLabels.role")}</FormLabel>
                  <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
                    {(
                      Object.entries(ROLE_CONFIG) as [
                        UserRole,
                        (typeof ROLE_CONFIG)[UserRole],
                      ][]
                    ).map(([role, config]) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => field.onChange(role)}
                        className={cn(
                          "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
                          selectedRole === role
                            ? config.activeClassName
                            : cn(
                                "bg-transparent text-muted-foreground hover:text-foreground",
                                config.className
                              )
                        )}
                      >
                        {t(`roles.${role}`)}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? t("saving") : t("saveChanges")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** Icon shown in table rows on hover to indicate clickability */
export function UserDetailHoverIcon() {
  return (
    <span className="flex items-center justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
      <Eye className="size-4 text-muted-foreground" />
    </span>
  );
}
