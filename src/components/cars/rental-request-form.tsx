"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import type { CreateRentalInput } from "@/lib/validations/rentals";
import { createRentalSchema } from "@/lib/validations/rentals";
import { createRentalRequest } from "@/actions/rentals";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type RentalRequestFormProps = {
  carId: string;
  isLoggedIn: boolean;
};

export function RentalRequestForm({
  carId,
  isLoggedIn,
}: RentalRequestFormProps) {
  const form = useForm<CreateRentalInput>({
    resolver: zodResolver(createRentalSchema),
    defaultValues: {
      carId,
      startDate: "",
      endDate: "",
      ...(!isLoggedIn && {
        guestName: "",
        guestEmail: "",
        guestPhone: "",
      }),
    },
  });

  async function onSubmit(values: CreateRentalInput) {
    const result = await createRentalRequest(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Rental request submitted successfully!");
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <input type="hidden" {...form.register("carId")} />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {field.value
                        ? format(new Date(field.value + "T00:00:00"), "PPP")
                        : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      field.value
                        ? new Date(field.value + "T00:00:00")
                        : undefined
                    }
                    onSelect={(date) => {
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {field.value
                        ? format(new Date(field.value + "T00:00:00"), "PPP")
                        : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      field.value
                        ? new Date(field.value + "T00:00:00")
                        : undefined
                    }
                    onSelect={(date) => {
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isLoggedIn && (
          <>
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
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
              name="guestPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+36 30 123 4567"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Submit Rental Request
        </Button>
      </form>
    </Form>
  );
}
