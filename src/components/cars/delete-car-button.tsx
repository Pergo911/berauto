"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { deleteCar } from "@/actions/cars";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteCarButtonProps = {
  carId: string;
  carName: string;
};

export function DeleteCarButton({ carId, carName }: DeleteCarButtonProps) {
  const router = useRouter();
  const t = useTranslations("CarDetailDialog");
  const tCommon = useTranslations("Common");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCar(carId);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="size-3.5" />
          {t("deleteButton")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich("deleteConfirmDesc", {
              name: carName,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? t("deletingButton") : t("deleteButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
