"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import {
  CalendarIcon,
  CircleCheck,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

import type { CreateRentalInput } from "@/lib/validations/rentals";
import { createRentalSchema } from "@/lib/validations/rentals";
import { createRentalRequest } from "@/actions/rentals";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type BookedInterval = {
  start: Date;
  end: Date;
};

type SelectionPhase = "start" | "end";

type RentalRequestFormProps = {
  carId: string;
  dailyRate: number;
  isLoggedIn: boolean;
  bookedIntervals: BookedInterval[];
};

export function RentalRequestForm({
  carId,
  dailyRate,
  isLoggedIn,
  bookedIntervals,
}: RentalRequestFormProps) {
  "use no memo";
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectionPhase, setSelectionPhase] = useState<SelectionPhase>("start");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<CreateRentalInput>({
    resolver: zodResolver(createRentalSchema),
    defaultValues: {
      carId,
      startDate: "",
      endDate: "",
      notes: "",
      ...(!isLoggedIn && {
        guestName: "",
        guestEmail: "",
        guestPhone: "",
      }),
    },
  });

  const today = startOfDay(new Date());

  // Normalize booked intervals to start-of-day to avoid time-zone edge cases
  const normalizedIntervals = bookedIntervals.map((interval) => ({
    start: startOfDay(interval.start),
    end: startOfDay(interval.end),
  }));

  /** Returns true if [from, to] overlaps any booked interval. */
  function rangeSpansBooked(from: Date, to: Date): boolean {
    return normalizedIntervals.some(
      (interval) => from < interval.end && to > interval.start
    );
  }

  function handleReset() {
    setDateRange(undefined);
    setSelectionPhase("start");
    form.setValue("startDate", "", { shouldValidate: false });
    form.setValue("endDate", "", { shouldValidate: false });
  }

  /**
   * Two-phase selection:
   * - phase "start": any click sets start date, advances to "end" phase.
   * - phase "end":   click after start → sets end date, closes popover,
   *                  resets to "start" phase.
   *                  click on or before start → updates start date,
   *                  stays in "end" phase so user still picks end.
   *
   * We ignore DayPicker's computed range and drive selection entirely
   * from `selectedDay` so we have full control over the alternating logic.
   */
  function handleRangeSelect(
    _computed: DateRange | undefined,
    selectedDay: Date
  ) {
    if (selectionPhase === "start") {
      setDateRange({ from: selectedDay, to: undefined });
      form.setValue("startDate", format(selectedDay, "yyyy-MM-dd"), {
        shouldValidate: true,
      });
      form.setValue("endDate", "", { shouldValidate: false });
      setSelectionPhase("end");
      return;
    }

    // Phase "end"
    const from = dateRange?.from;

    if (!from) {
      // Shouldn't happen, but fall back to treating as a start click
      setDateRange({ from: selectedDay, to: undefined });
      form.setValue("startDate", format(selectedDay, "yyyy-MM-dd"), {
        shouldValidate: true,
      });
      form.setValue("endDate", "", { shouldValidate: false });
      return;
    }

    if (selectedDay.getTime() === from.getTime()) {
      // Clicking the start date again cancels the selection. This is the
      // intended escape hatch for single-day free spots: since same-day
      // rentals are not allowed (server requires startDate < endDate),
      // re-clicking the start signals "never mind" rather than looping.
      handleReset();
      return;
    }

    if (selectedDay < from) {
      // Clicked before the current start: update start, stay in "end" phase
      setDateRange({ from: selectedDay, to: undefined });
      form.setValue("startDate", format(selectedDay, "yyyy-MM-dd"), {
        shouldValidate: true,
      });
      form.setValue("endDate", "", { shouldValidate: false });
      return;
    }

    if (rangeSpansBooked(from, selectedDay)) {
      // Range would overlap a booked interval: silently keep only start
      setDateRange({ from });
      return;
    }

    // Valid end date — complete the selection
    setDateRange({ from, to: selectedDay });
    form.setValue("startDate", format(from, "yyyy-MM-dd"), {
      shouldValidate: true,
    });
    form.setValue("endDate", format(selectedDay, "yyyy-MM-dd"), {
      shouldValidate: true,
    });
    setSelectionPhase("start");
    setCalendarOpen(false);
  }

  function handleOpenChange(open: boolean) {
    setCalendarOpen(open);
    // When reopening a complete range, reset to "start" so the user can
    // intuitively pick a new start date.
    if (open && dateRange?.from && dateRange?.to) {
      setSelectionPhase("start");
    }
  }

  async function onSubmit(values: CreateRentalInput) {
    const result = await createRentalRequest(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setSubmitted(true);
  }

  // react-hook-form watch() is intentionally used here; opt out of React Compiler memoization for this component
  // eslint-disable-next-line react-hooks/incompatible-library
  const startDateValue = form.watch("startDate");
  const endDateValue = form.watch("endDate");

  const estimatedDays =
    startDateValue && endDateValue
      ? differenceInCalendarDays(
          new Date(endDateValue + "T00:00:00"),
          new Date(startDateValue + "T00:00:00")
        )
      : null;
  const estimatedTotal =
    estimatedDays !== null ? estimatedDays * dailyRate : null;

  const disabledDates = [
    { before: today },
    ...normalizedIntervals.map(({ start, end }) => ({ from: start, to: end })),
  ];

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-2">
          <CircleCheck className="size-4 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Rental request submitted!
          </p>
        </div>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          Your request has been received. An agent will review it shortly and
          you will be notified of the decision.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <input type="hidden" {...form.register("carId")} />

        {/* Single range date picker */}
        <div className="flex flex-col gap-2">
          <FormLabel>Rental Period</FormLabel>
          <Popover open={calendarOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="size-4 shrink-0" />
                {startDateValue && endDateValue ? (
                  <span>
                    {format(new Date(startDateValue + "T00:00:00"), "PPP")}
                    {" \u2013 "}
                    {format(new Date(endDateValue + "T00:00:00"), "PPP")}
                  </span>
                ) : startDateValue ? (
                  <span>
                    {format(new Date(startDateValue + "T00:00:00"), "PPP")}
                    <span className={cn("text-muted-foreground")}>
                      {" \u2013 Pick end date"}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Pick start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {/* Phase indicator */}
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  Click to select{" "}
                  <strong>
                    {selectionPhase === "start" ? "start" : "end"}
                  </strong>{" "}
                  date
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              </div>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleRangeSelect}
                disabled={disabledDates}
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.startDate && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.startDate.message}
            </p>
          )}
          {form.formState.errors.endDate && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.endDate.message}
            </p>
          )}
        </div>

        {/* Estimated total cost */}
        <div className="rounded-md border bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              {estimatedDays !== null
                ? `${estimatedDays} ${estimatedDays === 1 ? "day" : "days"} \u00d7 ${formatCurrency(dailyRate)}/day`
                : `${formatCurrency(dailyRate)}/day`}
            </span>
            <span className="text-base font-semibold text-foreground">
              {estimatedTotal !== null ? formatCurrency(estimatedTotal) : "—"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated total cost
          </p>
        </div>

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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or notes for the agent… (optional)"
                  className="min-h-[80px] resize-none"
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
