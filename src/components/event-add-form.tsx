"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PlusIcon } from "lucide-react";
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

const eventAddFormSchema = z.object({
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

type EventAddFormValues = z.infer<typeof eventAddFormSchema>;

interface EventAddFormProps {
  start: Date;
  end: Date;
}

export function EventAddForm({ start, end }: EventAddFormProps) {
  const { events, addEvent } = useEvents();
  const { eventAddOpen, setEventAddOpen } = useEvents();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventAddFormSchema>>({
    resolver: zodResolver(eventAddFormSchema),
  });

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      start: start,
      end: end,
      color: "#76c7ef",
    });
  }, [form, start, end]);

  async function onSubmit(data: EventAddFormValues) {
    const newEvent = {
      id: String(events.length + 1),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      color: data.color,
    };

    try {
      // Wysyłka do API
      const response = await fetch("/api/dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          start_time: data.start,
          end_time: data.end,
        }),
      });

      console.log("response", response);

      if (!response.ok) {
        toast({
          title: "Błąd!",
          description: "Nie udało się dodać wydarzenia. Spróbuj ponownie.",
          variant: "destructive",
          action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
        });
        return;
      }

      addEvent(newEvent);
      setEventAddOpen(false);
      toast({
        title: "Event added!",
        action: <ToastAction altText={"Click here to dismiss notification"}>Dismiss</ToastAction>,
      });
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Błąd!",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
        action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
      });
    }
  }

  return (
    <AlertDialog open={eventAddOpen}>
      <AlertDialogTrigger className="flex" asChild>
        <Button className="w-38 md:w-44 text-xs md:text-sm" variant="default" onClick={() => setEventAddOpen(true)}>
          <PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
          <p>Dodaj wydarzenie</p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dodaj wydarzenie</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tytuł</FormLabel>
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
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Daily session" className="max-h-36" {...field} />
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
                  <FormLabel htmlFor="datetime">Godzina rozpoczęcia</FormLabel>
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
                  <FormLabel htmlFor="datetime">Godzina zakończenia</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={field.onChange} hourCycle={24} granularity="minute" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
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
            />
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel onClick={() => setEventAddOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Add Event</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
