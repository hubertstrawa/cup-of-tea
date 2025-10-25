
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HexColorPicker } from "react-colorful";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DateTimePicker } from "./date-picker";
import { useEvents } from "@/components/context/events-context";
import { ToastAction } from "./ui/toast";
import type { CalendarEvent } from "@/components/utils-front/data";
import { Button } from "./ui/button";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { normalizeDateToMinutes } from "@/lib/utils";

const eventEditFormSchema = z.object({
  id: z.string(),
  title: z
    .string({ required_error: "Please enter a title." })
    .min(1, { message: "Must provide a title for this event." }),
  description: z
    .string({ required_error: "Please enter a description." })
    .min(1, { message: "Must provide a description for this event." }),
  start: z.date({
    required_error: "Please select a start time",
    invalid_type_error: "That's not a date!",
  }),
  end: z.date({
    required_error: "Please select an end time",
    invalid_type_error: "That's not a date!",
  }),
  color: z
    .string({ required_error: "Please select an event color." })
    .min(1, { message: "Must provide a title for this event." }),
});

type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

interface EventEditFormProps {
  oldEvent?: CalendarEvent;
  event?: CalendarEvent;
  isDrag: boolean;
  displayButton: boolean;
  closeEventView?: () => void;
}

export function EventEditForm({ oldEvent, event, isDrag, displayButton, closeEventView }: EventEditFormProps) {
  const { addEvent, deleteEvent } = useEvents();
  const { eventEditOpen, setEventEditOpen } = useEvents();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventEditFormSchema>>({
    resolver: zodResolver(eventEditFormSchema),
  });

  const handleEditCancellation = () => {
    if (isDrag && oldEvent) {
      const resetEvent = {
        id: oldEvent.id,
        title: oldEvent.title,
        description: oldEvent.description,
        start: oldEvent.start,
        end: oldEvent.end,
        color: oldEvent.backgroundColor || "#76c7ef",
        dateStatus: oldEvent.dateStatus,
      };

      deleteEvent(oldEvent.id);
      addEvent(resetEvent);
    }
    setEventEditOpen(false);
  };

  useEffect(() => {
    form.reset({
      id: event?.id,
      title: event?.title,
      description: event?.description,
      start: event?.start as Date,
      end: event?.end as Date,
      color: event?.backgroundColor,
      dateStatus: event?.dateStatus,
    });
  }, [form, event]);

  async function onSubmit(data: EventEditFormValues) {
    // Normalize dates to ensure seconds and milliseconds are 0
    const normalizedStart = normalizeDateToMinutes(data.start);
    const normalizedEnd = normalizeDateToMinutes(data.end);

    const newEvent = {
      id: data.id,
      title: data.title,
      description: data.description,
      start: normalizedStart,
      end: normalizedEnd,
      color: data.color,
      dateStatus: data.dateStatus,
    };

    try {
      // Call API to update the event
      const response = await fetch(`/api/dates/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: normalizedStart.toISOString(),
          end_time: normalizedEnd.toISOString(),
        }),
      });

      if (!response.ok) {
        toast({
          title: "Błąd!",
          description: "Nie udało się edytować wydarzenia. Spróbuj ponownie.",
          variant: "destructive",
          action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
        });
        return;
      }

      // Update local state only after successful API call
      deleteEvent(data.id);
      closeEventView?.();
      addEvent(newEvent);
      setEventEditOpen(false);

      toast({
        title: "Wydarzenie zaktualizowane!",
        variant: "default",
        action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
      });
    } catch {
      toast({
        title: "Błąd!",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
        action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
      });
    }
  }

  return (
    <AlertDialog open={eventEditOpen}>
      {displayButton && (
        <AlertDialogTrigger asChild>
          <Button
            className="w-full w-auto text-xs md:text-sm mb-1"
            variant="default"
            onClick={() => setEventEditOpen(true)}
          >
            <Pencil2Icon />
            Edytuj wydarzenie
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit {event?.title}</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Standup Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Daily session" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={field.onChange} hourCycle={24} granularity="minute" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">End</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={field.onChange} hourCycle={24} granularity="minute" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild className="cursor-pointer">
                        <div className="flex flex-row w-full items-center space-x-2 pl-2">
                          <div
                            className={`w-5 h-5 rounded-full cursor-pointer`}
                            style={{ backgroundColor: field.value }}
                          ></div>
                          <Input {...field} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="flex mx-auto items-center justify-center">
                        <HexColorPicker className="flex" color={field.value} onChange={field.onChange} />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel onClick={() => handleEditCancellation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Save</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
