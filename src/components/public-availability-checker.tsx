import React, { useEffect, useState } from "react";
// import { Calendar } from "@/components/ui/calendar";
// import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import type { DateDTO } from "@/types";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";

interface PublicAvailabilityCheckerProps {
  tutorId: string;
  isLoggedIn: boolean;
  isTutor: boolean;
}

export default function PublicAvailabilityChecker({ tutorId, isLoggedIn, isTutor }: PublicAvailabilityCheckerProps) {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - 1);

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [threeDaysSlots, setThreeDaysSlots] = useState<Record<string, DateDTO[]>>({});
  const [loading, setLoading] = useState(true);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<DateDTO | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Funkcja do pobierania najbliższego dostępnego terminu i ustawienia daty
  const fetchAndSetNextAvailableSlot = async () => {
    try {
      setLoadingInitial(true);
      const response = await fetch(
        `/api/public/tutor/${tutorId}/dates?status=available&limit=1&from_date=${format(new Date(), "yyyy-MM-dd")}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch next available slot");
      }

      const data = await response.json();
      const nextSlot = data.data?.[0] || null;
      setNextAvailableSlot(nextSlot);

      // Ustaw datę początkową na dzień z najbliższym dostępnym terminem lub dzisiejszą datę
      if (nextSlot) {
        const slotDate = new Date(nextSlot.start_time);
        setStartDate(startOfDay(slotDate));
      } else {
        setStartDate(startOfDay(new Date()));
      }
    } catch {
      setNextAvailableSlot(null);
      setStartDate(startOfDay(new Date()));
    } finally {
      setLoadingInitial(false);
    }
  };

  // Funkcja do pobierania dostępnych terminów dla trzech dni
  const fetchThreeDaysSlots = async (startDate: Date) => {
    try {
      setLoading(true);
      const slotsData: Record<string, DateDTO[]> = {};

      // Pobierz terminy dla trzech kolejnych dni
      for (let i = 0; i < 3; i++) {
        const currentDate = addDays(startDate, i);
        const dateString = format(currentDate, "yyyy-MM-dd");

        try {
          const response = await fetch(`/api/public/tutor/${tutorId}/dates?date=${dateString}&status=available`);

          if (response.ok) {
            const data = await response.json();
            slotsData[dateString] = data.data || [];
          } else {
            slotsData[dateString] = [];
          }
        } catch {
          slotsData[dateString] = [];
        }
      }

      setThreeDaysSlots(slotsData);
    } catch {
      setThreeDaysSlots({});
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

    if (isTutor) {
      // Nauczyciele nie mogą rezerwować lekcji
      alert(
        "Jako nauczyciel nie możesz rezerwować lekcji u innych nauczycieli. Uczniowie mogą rezerwować Twoje dostępne terminy."
      );
      return;
    }

    // Jeśli użytkownik jest uczniem i zalogowany, przekieruj do strony rezerwacji
    window.location.href = `/booking/${slot.id}`;
  };

  const navigateThreeDays = (direction: "prev" | "next") => {
    if (!startDate) return;

    const newStartDate = direction === "next" ? addDays(startDate, 3) : subDays(startDate, 3);

    // Nie pozwalaj na wybór dat z przeszłości
    if (newStartDate <= dateObj) return;

    setStartDate(newStartDate);
  };

  // Pobierz najbliższy dostępny termin i ustaw datę przy pierwszym załadowaniu
  useEffect(() => {
    fetchAndSetNextAvailableSlot();
  }, [tutorId]);

  // Pobierz dostępne terminy dla trzech dni gdy zmieni się data początkowa
  useEffect(() => {
    if (startDate && !loadingInitial) {
      fetchThreeDaysSlots(startDate);
    }
  }, [startDate, tutorId, loadingInitial]);

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
                Najbliższy dostępny termin:{" "}
                <span className="font-medium text-primary">
                  {format(new Date(nextAvailableSlot.start_time), "EEEE, d MMMM", { locale: pl })}
                </span>
              </div>
            )}
          </div>

          {/* Nawigacja między grupami trzech dni */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateThreeDays("prev")}
              disabled={startDate && subDays(startDate, 3) <= dateObj}
              className="px-3"
            >
              ← Poprzednie
            </Button>

            <div className="text-center min-w-[250px]">
              <div className="font-semibold">
                {startDate
                  ? `${format(startDate, "d MMM", { locale: pl })} - ${format(addDays(startDate, 2), "d MMM yyyy", { locale: pl })}`
                  : ""}
              </div>
              <div className="text-xs text-muted-foreground">Przeglądaj dostępne terminy</div>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigateThreeDays("next")} className="px-3">
              Następne →
            </Button>
          </div>
        </div>

        {/* Wyświetlanie terminów dla trzech dni */}
        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {startDate &&
                [0, 1, 2].map((dayOffset) => {
                  const currentDate = addDays(startDate, dayOffset);
                  const dateString = format(currentDate, "yyyy-MM-dd");
                  const daySlots = threeDaysSlots[dateString] || [];

                  return (
                    <div key={dateString} className="space-y-3">
                      {/* Nagłówek dnia */}
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-sm">{format(currentDate, "EEEE", { locale: pl })}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(currentDate, "d MMMM yyyy", { locale: pl })}
                        </div>
                      </div>

                      {/* Terminy dla tego dnia */}
                      <div className="space-y-2 min-h-[200px]">
                        {daySlots.length === 0 ? (
                          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                            Brak dostępnych terminów
                          </div>
                        ) : (
                          daySlots.map((slot) => {
                            const startTime = new Date(slot.start_time);
                            const endTime = new Date(slot.end_time);
                            const isNextAvailable = nextAvailableSlot?.id === slot.id;

                            return (
                              <Card
                                key={slot.id}
                                onClick={() => handleSlotClick(slot)}
                                className={`p-3 cursor-pointer hover:scale-[1.02] transition-all shadow-sm ${
                                  isNextAvailable
                                    ? "bg-primary/10 hover:bg-primary/20 border-primary/20 border-2"
                                    : "bg-secondary hover:bg-secondary/40"
                                }`}
                              >
                                {isNextAvailable && (
                                  <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                                    🎯 Najbliższy dostępny
                                  </div>
                                )}
                                <div className="font-medium text-sm">
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
                                {slot.additional_info &&
                                  (typeof slot.additional_info === "string"
                                    ? slot.additional_info.trim() !== ""
                                    : Object.keys(slot.additional_info).length > 0) && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {typeof slot.additional_info === "string"
                                        ? slot.additional_info
                                        : JSON.stringify(slot.additional_info)}
                                    </div>
                                  )}
                                <div className="text-xs text-muted-foreground mt-2">
                                  {!isLoggedIn
                                    ? "Zaloguj się aby zarezerwować"
                                    : isTutor
                                      ? "Nauczyciele nie mogą rezerwować"
                                      : "Kliknij aby zarezerwować"}
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Przycisk do przejścia do najbliższego terminu jeśli nie ma terminów w aktualnym widoku */}
          {!loading &&
            startDate &&
            Object.values(threeDaysSlots).every((slots) => slots.length === 0) &&
            nextAvailableSlot && (
              <div className="text-center mt-6">
                <div className="text-muted-foreground mb-4">Brak dostępnych terminów w tym okresie</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const slotDate = new Date(nextAvailableSlot.start_time);
                    setStartDate(startOfDay(slotDate));
                  }}
                >
                  Przejdź do najbliższego dostępnego terminu
                </Button>
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}
