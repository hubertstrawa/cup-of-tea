import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import type { DateDTO } from "@/types";
import { format } from "date-fns";

interface PublicAvailabilityCheckerProps {
  tutorId: string;
  isLoggedIn: boolean;
}

export default function PublicAvailabilityChecker({ tutorId, isLoggedIn }: PublicAvailabilityCheckerProps) {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - 1);

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<DateDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Funkcja do pobierania dostępnych terminów z API dla konkretnego tutora
  const fetchAvailableSlots = async (selectedDate: Date) => {
    try {
      setLoading(true);
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/public/tutor/${tutorId}/dates?date=${dateString}&status=available`);

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
    if (!isLoggedIn) {
      // Przekieruj do logowania z informacją o wybranym terminie
      const bookingUrl = `/booking/${slot.id}`;
      window.location.href = `/login?redirect=${encodeURIComponent(bookingUrl)}`;
      return;
    }
    
    // Jeśli użytkownik jest zalogowany, przekieruj do strony rezerwacji
    window.location.href = `/booking/${slot.id}`;
  };

  // Pobierz dostępne terminy gdy zmieni się data
  useEffect(() => {
    if (date) {
      fetchAvailableSlots(date);
    }
  }, [date, tutorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        <div className="text-sm text-muted-foreground mt-1">
                          {typeof slot.additional_info === 'string' 
                            ? slot.additional_info 
                            : JSON.stringify(slot.additional_info)
                          }
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {isLoggedIn ? "Kliknij aby zarezerwować" : "Kliknij aby się zalogować i zarezerwować"}
                      </div>
                    </Card>
                  );
                })
              )}
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}
