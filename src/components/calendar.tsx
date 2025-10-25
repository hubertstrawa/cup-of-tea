import { useEvents } from "@/components/context/events-context";
import "@/styles/calendar.css";
import type {
  DateSelectArg,
  DayCellContentArg,
  DayHeaderContentArg,
  EventChangeArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

import { useRef, useState, useEffect } from "react";
import CalendarNav from "./calendar-nav";
import { earliestTime, latestTime } from "@/components/utils-front/data";
import type { CalendarEvent } from "@/components/utils-front/data";
import { getDateFromMinutes } from "@/components/utils-front/utils";
import { Card } from "./ui/card";
import { EventEditForm } from "./event-edit-form";
import { EventView } from "./event-view";

interface EventItemProps {
  info: EventContentArg;
}

interface DayHeaderProps {
  info: DayHeaderContentArg;
}

interface DayRenderProps {
  info: DayCellContentArg;
}

export default function Calendar() {
  const { events, setEventAddOpen, setEventEditOpen, setEventViewOpen } = useEvents();

  const calendarRef = useRef<FullCalendar | null>(null);
  const [viewedDate, setViewedDate] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(new Date());
  const [selectedEnd, setSelectedEnd] = useState(new Date());
  const [selectedOldEvent, setSelectedOldEvent] = useState<CalendarEvent | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isDrag, setIsDrag] = useState(false);

  // Keyboard shortcuts for better navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!calendarRef.current) return;
      
      const calendarApi = calendarRef.current.getApi();
      
      // Prevent default browser shortcuts when calendar is focused
      if (event.target instanceof HTMLElement && 
          (event.target.closest('.fc') || event.target.closest('[data-calendar-wrapper]'))) {
        
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            calendarApi.prev();
            break;
          case 'ArrowRight':
            event.preventDefault();
            calendarApi.next();
            break;
          case 'Home':
            event.preventDefault();
            calendarApi.today();
            break;
          case '1':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              calendarApi.changeView('timeGridDay');
            }
            break;
          case '2':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              calendarApi.changeView('timeGridWeek');
            }
            break;
          case '3':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              calendarApi.changeView('dayGridMonth');
            }
            break;
          case 'n':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              setEventAddOpen(true);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setEventAddOpen]);

  const handleEventClick = (info: EventClickArg) => {
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      backgroundColor: info.event.backgroundColor,
      start: info.event.start!,
      end: info.event.end!,
      dateStatus: info.event.extendedProps.dateStatus,
    };

    setIsDrag(false);
    setSelectedOldEvent(event);
    setSelectedEvent(event);
    setEventViewOpen(true);
  };

  const handleEventChange = (info: EventChangeArg) => {
    const event: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      backgroundColor: info.event.backgroundColor,
      start: info.event.start!,
      end: info.event.end!,
      dateStatus: info.event.extendedProps.dateStatus,
    };

    const oldEvent: CalendarEvent = {
      id: info.oldEvent.id,
      title: info.oldEvent.title,
      description: info.oldEvent.extendedProps.description,
      backgroundColor: info.oldEvent.backgroundColor,
      start: info.oldEvent.start!,
      end: info.oldEvent.end!,
      dateStatus: info.oldEvent.extendedProps.dateStatus,
    };

    setIsDrag(true);
    setSelectedOldEvent(oldEvent);
    setSelectedEvent(event);
    setEventEditOpen(true);
  };

  const EventItem = ({ info }: EventItemProps) => {
    const { event } = info;
    const [left, right] = info.timeText.split(" - ");

    return (
      <div className="overflow-hidden w-full h-full">
        {info.view.type == "dayGridMonth" ? (
          <div
            style={{ backgroundColor: info.backgroundColor }}
            className={`flex flex-col rounded-lg w-full px-3 py-2 shadow-sm border border-white/20 text-xs transition-all hover:shadow-md hover:scale-[1.02]`}
          >
            <p className="font-semibold text-gray-900 line-clamp-1 w-11/12">{event.title}</p>
            <div className="flex items-center gap-1 text-gray-700 text-[0.65rem]">
              <span>{left}</span>
              <span>-</span>
              <span>{right}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center px-2 py-1 text-xs transition-all hover:bg-white/10 rounded">
            <p className="font-semibold text-gray-900 line-clamp-2 leading-tight">{event.title}</p>
            <p className="text-gray-700 text-[0.65rem] mt-0.5">{`${left} - ${right}`}</p>
          </div>
        )}
      </div>
    );
  };

  const DayHeader = ({ info }: DayHeaderProps) => {
    const [weekday] = info.text.split(" ");

    return (
      <div className="flex items-center justify-center h-full overflow-hidden py-2">
        {info.view.type == "timeGridDay" ? (
          <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-b from-primary/5 to-primary/10">
            <p className="text-lg font-bold text-primary">
              {info.date.toLocaleDateString("pl-PL", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ) : info.view.type == "timeGridWeek" ? (
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-muted/50">
            <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{weekday}</p>
            {info.isToday ? (
              <div className="flex bg-primary h-8 w-8 rounded-full items-center justify-center shadow-md">
                <p className="font-bold text-primary-foreground text-sm">{info.date.getDate()}</p>
              </div>
            ) : (
              <div className="flex h-8 w-8 rounded-full items-center justify-center hover:bg-muted transition-colors">
                <p className="font-medium text-sm">{info.date.getDate()}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center p-1">
            <p className="font-medium text-sm">{weekday}</p>
          </div>
        )}
      </div>
    );
  };

  const DayRender = ({ info }: DayRenderProps) => {
    return (
      <div className="flex justify-center p-1">
        {info.view.type == "dayGridMonth" && info.isToday ? (
          <div className="flex h-8 w-8 rounded-full bg-primary items-center justify-center text-sm font-bold text-primary-foreground shadow-md">
            {info.dayNumberText}
          </div>
        ) : (
          <div className="flex h-8 w-8 rounded-full items-center justify-center text-sm font-medium hover:bg-muted transition-colors">
            {info.dayNumberText}
          </div>
        )}
      </div>
    );
  };

  const handleDateSelect = (info: DateSelectArg) => {
    setSelectedStart(info.start);
    setSelectedEnd(info.end);
  };

  const earliestHour = getDateFromMinutes(earliestTime).getHours().toString().padStart(2, "0");
  const earliestMin = getDateFromMinutes(earliestTime).getMinutes().toString().padStart(2, "0");
  const latestHour = getDateFromMinutes(latestTime).getHours().toString().padStart(2, "0");
  const latestMin = getDateFromMinutes(latestTime).getMinutes().toString().padStart(2, "0");

  const calendarEarliestTime = `${earliestHour}:${earliestMin}`;
  const calendarLatestTime = `${latestHour}:${latestMin}`;
  return (
    <div className="space-y-6" data-calendar-wrapper>
      {/* Enhanced navigation */}
      <CalendarNav calendarRef={calendarRef} start={selectedStart} end={selectedEnd} viewedDate={viewedDate} />
      
      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>
          <span className="font-medium">Skróty klawiszowe:</span>
          <span className="ml-2">← → (nawigacja)</span>
          <span className="ml-2">Home (dzisiaj)</span>
          <span className="ml-2">Ctrl+1/2/3 (widoki)</span>
          <span className="ml-2">Ctrl+N (nowe wydarzenie)</span>
        </p>
      </div>

      {/* Main calendar container with improved styling */}
      <Card className="overflow-hidden border-2 shadow-lg">
        <div className="p-4">
          <FullCalendar
            key={events.length}
            ref={calendarRef}
            timeZone="local"
            locale="pl"
            plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false}
            slotMinTime={calendarEarliestTime}
            slotMaxTime={calendarLatestTime}
            allDaySlot={false}
            firstDay={1}
            height={"40vh"}
            displayEventEnd={true}
            windowResizeDelay={0}
            events={events}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: false,
            }}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: false,
            }}
            eventBorderColor={"transparent"}
            contentHeight={"auto"}
            expandRows={true}
            dayCellContent={(dayInfo) => <DayRender info={dayInfo} />}
            eventContent={(eventInfo) => <EventItem info={eventInfo} />}
            dayHeaderContent={(headerInfo) => <DayHeader info={headerInfo} />}
            eventClick={(eventInfo) => handleEventClick(eventInfo)}
            eventChange={(eventInfo) => handleEventChange(eventInfo)}
            select={handleDateSelect}
            datesSet={(dates) => setViewedDate(dates.view.currentStart)}
            dateClick={() => setEventAddOpen(true)}
            nowIndicator
            editable
            selectable
            slotDuration="00:30:00"
            snapDuration="00:15:00"
          />
        </div>
      </Card>
      
      {/* Event forms and views */}
      <EventEditForm oldEvent={selectedOldEvent} event={selectedEvent} isDrag={isDrag} displayButton={false} />
      <EventView event={selectedEvent} />
    </div>
  );
}
