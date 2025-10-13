"use client";

import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { useEvents } from "@/components/context/events-context";
import { AvailabilityCheckerEventAddForm } from "./availability-checker-event-add-form";
import type { DateDTO } from "@/types";
import { format } from "date-fns";

export default function AvailabilityChecker() {
  const { setAvailabilityCheckerEventAddOpen } = useEvents();

  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - 1);

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<DateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<DateDTO | null>(null);

  // Funkcja do pobierania dostępnych terminów z API
  const fetchAvailableSlots = async (selectedDate: Date) => {
    try {
      setLoading(true);
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/dates?date=${dateString}&status=available`);

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const data = await response.json();
      setAvailableSlots(data.data || []);
    } catch {
      // Error is handled by setting empty array
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: DateDTO) => {
    setSelectedSlot(slot);
    setAvailabilityCheckerEventAddOpen(true);
  };

  // Pobierz dostępne terminy gdy zmieni się data
  useEffect(() => {
    if (date) {
      fetchAvailableSlots(date);
    }
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <h1>Loading...</h1>
        {/* <Script type="module" src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/tailspin.js" /> */}
      </div>
    );
  }

  return (
    <div className="mx-2 md:mx-5">
      <Card className="mt-4">
        <div className="flex flex-wrap justify-center mx-3 sm:flex-row">
          <div className="flex flex-col w-full py-3 sm:w-1/2 justify-center items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date <= dateObj}
              className="rounded-md border shadow-md"
            />
          </div>

          <div className="flex flex-col w-full py-3 sm:w-1/2 mt-4 mb-2 sm:mt-0">
            <ScrollArea className="flex h-96 px-4">
              {availableSlots.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Brak dostępnych terminów na wybrany dzień
                </div>
              ) : (
                availableSlots.map((slot) => {
                  const startTime = new Date(slot.start_time);
                  const endTime = new Date(slot.end_time);

                  return (
                    <Card
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className="flex flex-col py-2 px-4 my-2 mx-auto w-11/12 bg-secondary hover:bg-secondary/40 cursor-pointer hover:scale-[1.03] transition-all shadow-sm"
                    >
                      <div className="font-medium">
                        {startTime.toLocaleString("pl-PL", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}{" "}
                        -{" "}
                        {endTime.toLocaleString("pl-PL", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                      {slot.additional_info && (
                        <div className="text-sm text-muted-foreground mt-1">{JSON.stringify(slot.additional_info)}</div>
                      )}
                    </Card>
                  );
                })
              )}
            </ScrollArea>
          </div>
        </div>
      </Card>
      {selectedSlot && (
        <AvailabilityCheckerEventAddForm
          start={new Date(selectedSlot.start_time)}
          end={new Date(selectedSlot.end_time)}
        />
      )}
    </div>
  );
}
