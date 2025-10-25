import React, { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import type { DateDTO } from "@/types";
import { format, addDays, subDays } from "date-fns";
import { pl } from "date-fns/locale";

interface PublicAvailabilityCheckerProps {
  tutorId: string;
  isLoggedIn: boolean;
}

export default function PublicAvailabilityChecker({ tutorId, isLoggedIn }: PublicAvailabilityCheckerProps) {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - 1);

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<DateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<DateDTO | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Funkcja do pobierania najbliższego dostępnego terminu i ustawienia daty
  const fetchAndSetNextAvailableSlot = async () => {
    try {
      setLoadingInitial(true);
      const response = await fetch(`/api/public/tutor/${tutorId}/dates?status=available&limit=1&from_date=${format(new Date(), "yyyy-MM-dd")}`);

      if (!response.ok) {
        throw new Error("Failed to fetch next available slot");
      }

      const data = await response.json();
      const nextSlot = data.data?.[0] || null;
      setNextAvailableSlot(nextSlot);
      
      // Ustaw datę na dzień z najbliższym dostępnym terminem lub dzisiejszą datę
      if (nextSlot) {
        const slotDate = new Date(nextSlot.start_time);
        setDate(slotDate);
      } else {
        setDate(new Date());
      }
    } catch {
      setNextAvailableSlot(null);
      setDate(new Date());
    } finally {
      setLoadingInitial(false);
    }
  };

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

  const navigateToDay = (direction: 'prev' | 'next') => {
    if (!date) return;
    
    const newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    
    // Nie pozwalaj na wybór dat z przeszłości
    if (newDate <= dateObj) return;
    
    setDate(newDate);
  };

  // Pobierz najbliższy dostępny termin i ustaw datę przy pierwszym załadowaniu
  useEffect(() => {
    fetchAndSetNextAvailableSlot();
  }, [tutorId]);

  // Pobierz dostępne terminy gdy zmieni się data
  useEffect(() => {
    if (date && !loadingInitial) {
      fetchAvailableSlots(date);
    }
  }, [date, tutorId, loadingInitial]);

  if (loadingInitial) {
    return (
      <div className="mx-2 md:mx-5">
        <Card className="mt-4">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-2 md:mx-5">
      <Card className="mt-4">
        <div className="p-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Dostępne terminy</h2>
            {nextAvailableSlot && (
              <div className="text-sm text-muted-foreground">
                Najbliższy dostępny termin: <span className="font-medium text-primary">
                  {format(new Date(nextAvailableSlot.start_time), "EEEE, d MMMM", { locale: pl })}
                </span>
              </div>
            )}
          </div>
          
          {/* Nawigacja między dniami */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToDay('prev')}
              disabled={date && subDays(date, 1) <= dateObj}
              className="px-3"
            >
              ← Poprzedni dzień
            </Button>
            
            <div className="text-center min-w-[200px]">
              <div className="font-semibold">
                {date ? format(date, "EEEE", { locale: pl }) : ''}
              </div>
              <div className="text-sm text-muted-foreground">
                {date ? format(date, "d MMMM yyyy", { locale: pl }) : ''}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToDay('next')}
              className="px-3"
            >
              Następny dzień →
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center mx-3 sm:flex-row">
          {/* <div className="flex flex-col w-full py-3 sm:w-1/2 justify-center items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date <= dateObj}
              className="rounded-md border shadow-md"
            />
          </div> */}

          <div className="flex flex-col w-full py-3 sm:w-1/2 mt-4 mb-2 sm:mt-0">
            <ScrollArea className="flex h-96 px-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">Brak dostępnych terminów na wybrany dzień</div>
                  {nextAvailableSlot && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        const slotDate = new Date(nextAvailableSlot.start_time);
                        setDate(slotDate);
                      }}
                    >
                      Przejdź do najbliższego terminu
                    </Button>
                  )}
                </div>
              ) : (
                availableSlots.map((slot) => {
                  const startTime = new Date(slot.start_time);
                  const endTime = new Date(slot.end_time);
                  const isNextAvailable = nextAvailableSlot?.id === slot.id;

                  return (
                    <Card
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={`flex flex-col py-2 px-4 my-2 mx-auto w-11/12 cursor-pointer hover:scale-[1.03] transition-all shadow-sm ${
                        isNextAvailable 
                          ? "bg-primary/10 hover:bg-primary/20 border-primary/20 border-2" 
                          : "bg-secondary hover:bg-secondary/40"
                      }`}
                    >
                      {isNextAvailable && (
                        <div className="text-xs font-semibold text-primary mb-1">
                          🎯 Najbliższy dostępny termin
                        </div>
                      )}
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
                      {(slot.additional_info && (
                        typeof slot.additional_info === 'string'
                          ? slot.additional_info.trim() !== ''
                          : Object.keys(slot.additional_info).length > 0
                      )) && (
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
