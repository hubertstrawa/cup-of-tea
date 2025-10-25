// import { initialEvents } from "@/components/utils-front/data";
import type { CalendarEvent } from "@/components/utils-front/data";
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  color: string;
  dateStatus: string;
}

interface EventsContextType {
  events: CalendarEvent[];
  addEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  eventViewOpen: boolean;
  setEventViewOpen: (value: boolean) => void;
  eventAddOpen: boolean;
  setEventAddOpen: (value: boolean) => void;
  eventEditOpen: boolean;
  setEventEditOpen: (value: boolean) => void;
  eventDeleteOpen: boolean;
  setEventDeleteOpen: (value: boolean) => void;
  availabilityCheckerEventAddOpen: boolean;
  setAvailabilityCheckerEventAddOpen: (value: boolean) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

export const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/dates?limit=100");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();

        // Ensure proper mapping from backend structure to CalendarEvent
        const mappedEvents: CalendarEvent[] = (data?.data || []).map((event: any) => ({
          // id: String(event.id),
          ...event,
          title: event.title ?? "A",
          dateStatus: event.status,
          description: event.description ?? "B",
          start: new Date(event.start_time || event.start), // Support both possible keys
          end: new Date(event.end_time || event.end),
          backgroundColor: event.backgroundColor ?? event.color ?? "#76c7ef",
        }));
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }
    fetchEvents();
  }, []);
  const [eventViewOpen, setEventViewOpen] = useState(false);
  const [eventAddOpen, setEventAddOpen] = useState(false);
  const [eventEditOpen, setEventEditOpen] = useState(false);
  const [eventDeleteOpen, setEventDeleteOpen] = useState(false);
  const [availabilityCheckerEventAddOpen, setAvailabilityCheckerEventAddOpen] = useState(false);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  const deleteEvent = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => Number(event.id) !== Number(id)));
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        deleteEvent,
        eventViewOpen,
        setEventViewOpen,
        eventAddOpen,
        setEventAddOpen,
        eventEditOpen,
        setEventEditOpen,
        eventDeleteOpen,
        setEventDeleteOpen,
        availabilityCheckerEventAddOpen,
        setAvailabilityCheckerEventAddOpen,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
