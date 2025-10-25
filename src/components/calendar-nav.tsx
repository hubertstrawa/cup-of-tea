
import { cn } from "@/components/utils-front/utils";
import { months } from "@/components/utils-front/data";
import type { calendarRef } from "@/components/utils-front/data";
import { Button } from "@/components/ui/button";
import {
  generateDaysInMonth,
  goNext,
  goPrev,
  goToday,
  handleDayChange,
  handleMonthChange,
  handleYearChange,
  setView,
} from "@/components/utils-front/calendar-utils";
import { useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, GalleryVertical, Home, Table, Tally3 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventAddForm } from "./event-add-form";

interface CalendarNavProps {
  calendarRef: calendarRef;
  start: Date;
  end: Date;
  viewedDate: Date;
}

export default function CalendarNav({ calendarRef, start, end, viewedDate }: CalendarNavProps) {
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const selectedMonth = viewedDate.getMonth() + 1;
  const selectedDay = viewedDate.getDate();
  const selectedYear = viewedDate.getFullYear();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = generateDaysInMonth(daysInMonth);

  const [daySelectOpen, setDaySelectOpen] = useState(false);
  const [monthSelectOpen, setMonthSelectOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-lg border">
        {/* Left side - Navigation controls */}
        <div className="flex items-center gap-2">
          {/* Quick navigation buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                for (let i = 0; i < 4; i++) goPrev(calendarRef);
              }}
              title="Poprzedni miesiąc"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                goPrev(calendarRef);
              }}
              title={currentView === "timeGridDay" ? "Poprzedni dzień" : currentView === "timeGridWeek" ? "Poprzedni tydzień" : "Poprzedni miesiąc"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Today button with icon */}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              goToday(calendarRef);
            }}
            className="gap-2 font-medium"
          >
            <Home className="h-4 w-4" />
            {currentView === "timeGridDay"
              ? "Dzisiaj"
              : currentView === "timeGridWeek"
                ? "Ten tydzień"
                : currentView === "dayGridMonth"
                  ? "Ten miesiąc"
                  : "Teraz"}
          </Button>

          {/* Forward navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                goNext(calendarRef);
              }}
              title={currentView === "timeGridDay" ? "Następny dzień" : currentView === "timeGridWeek" ? "Następny tydzień" : "Następny miesiąc"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                for (let i = 0; i < 4; i++) goNext(calendarRef);
              }}
              title="Następny miesiąc"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center - Date display and selection */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          
          {/* Day selector for day view */}
          {currentView == "timeGridDay" && (
            <Popover open={daySelectOpen} onOpenChange={setDaySelectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="min-w-[60px] justify-between font-semibold">
                  {selectedDay ? dayOptions.find((day) => day.value === String(selectedDay))?.label : "Dzień"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Szukaj dnia..." />
                  <CommandList>
                    <CommandEmpty>Nie znaleziono dnia.</CommandEmpty>
                    <CommandGroup>
                      {dayOptions.map((day) => (
                        <CommandItem
                          key={day.value}
                          value={day.value}
                          onSelect={(currentValue) => {
                            handleDayChange(calendarRef, viewedDate, currentValue);
                            setDaySelectOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              String(selectedDay) === day.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {day.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {/* Month selector */}
          <Popover open={monthSelectOpen} onOpenChange={setMonthSelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[120px] justify-between font-semibold"
              >
                {selectedMonth ? months.find((month) => month.value === String(selectedMonth))?.label : "Miesiąc"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Szukaj miesiąca..." />
                <CommandList>
                  <CommandEmpty>Nie znaleziono miesiąca.</CommandEmpty>
                  <CommandGroup>
                    {months.map((month) => (
                      <CommandItem
                        key={month.value}
                        value={month.label}
                        onSelect={(selectedLabel) => {
                          const selectedMonthObj = months.find((m) => m.label === selectedLabel);
                          if (selectedMonthObj) {
                            handleMonthChange(calendarRef, viewedDate, selectedMonthObj.value);
                          }
                          setMonthSelectOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(selectedMonth) === month.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {month.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Year selector */}
          <Input
            className="w-[80px] font-semibold text-center"
            type="number"
            value={selectedYear}
            onChange={(value) => handleYearChange(calendarRef, viewedDate, value)}
            min="2020"
            max="2030"
          />
        </div>

        {/* Right side - View controls and actions */}
        <div className="flex items-center gap-3">
          {/* Add event button */}
          <EventAddForm start={start} end={end} />
        </div>
      </div>

      {/* Secondary bar - View selector */}
      <div className="flex flex-wrap items-center justify-center gap-4">

        {/* View selector with improved design */}
        <Tabs defaultValue="timeGridWeek" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger
              value="timeGridDay"
              onClick={() => setView(calendarRef, "timeGridDay", setCurrentView)}
              className="flex items-center gap-2 font-medium"
            >
              <GalleryVertical className="h-4 w-4" />
              <span className="hidden sm:inline">Dzień</span>
            </TabsTrigger>
            <TabsTrigger
              value="timeGridWeek"
              onClick={() => setView(calendarRef, "timeGridWeek", setCurrentView)}
              className="flex items-center gap-2 font-medium"
            >
              <Tally3 className="h-4 w-4" />
              <span className="hidden sm:inline">Tydzień</span>
            </TabsTrigger>
            <TabsTrigger
              value="dayGridMonth"
              onClick={() => setView(calendarRef, "dayGridMonth", setCurrentView)}
              className="flex items-center gap-2 font-medium"
            >
              <Table className="h-4 w-4 rotate-90" />
              <span className="hidden sm:inline">Miesiąc</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
