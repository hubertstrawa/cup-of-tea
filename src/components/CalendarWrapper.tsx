import AvailabilityChecker from "@/components/availability-checker";
import Calendar from "@/components/calendar";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EventsProvider } from "@/components/context/events-context";
import { useUser } from "@/components/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/hooks/use-toast";
import { useState } from "react";

export default function CalendarWrapper() {
  const { user, loading } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Skopiowano!",
        description: "Link został skopiowany do schowka",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Błąd",
        description: "Nie udało się skopiować linku",
        variant: "destructive",
      });
    }
  };

  const tutorBookingUrl = user ? `${window.location.origin}/tutor/${user.id}` : "";

  return (
    <EventsProvider>
      <div className="py-4">
        <Tabs defaultValue="calendar" className="flex flex-col w-full items-center">
          {/* <TabsList className="flex justify-center mb-2">
            <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
            <TabsTrigger value="schedulingAssistant">Scheduling Assistant</TabsTrigger>
          </TabsList> */}
          <TabsContent value="calendar" className="w-full px-5 space-y-5">
            {/* Desktop: header and tutor link side by side, Mobile: stacked */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-0 flex-1">
                <h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">Kalendarz</h2>
                <p className="text-xs md:text-sm font-medium">
                  Aby uczniowie mogli zarezerwować termin, dodaj wydarzenie ze statusem <i>&quot;Dostępny&quot;</i>
                </p>
              </div>

              {!loading && user?.role === "tutor" && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg md:min-w-[600px]">
                  <span className="text-sm font-medium whitespace-nowrap">Link do rezerwacji dla uczniów:</span>
                  <Input value={tutorBookingUrl} readOnly className="flex-1 text-sm min-w-0" />
                  <Button
                    onClick={() => copyToClipboard(tutorBookingUrl)}
                    variant="outline"
                    size="sm"
                    disabled={copied}
                  >
                    {copied ? "Skopiowano!" : "Kopiuj link"}
                  </Button>
                </div>
              )}
            </div>

            <Separator />
            <Calendar />
          </TabsContent>
          <TabsContent value="schedulingAssistant" className="w-full px-5 space-y-5">
            <div className="space-y-0">
              <h2 className="flex items-center text-2xl font-semibold tracking-tight md:text-3xl">
                Scheduling Assistant
              </h2>
              <p className="text-xs md:text-sm font-medium">
                A scheduling assistant built to analyze a user&apos;s schedule and automatically show open spots.
              </p>
            </div>
            <Separator />
            <AvailabilityChecker />
          </TabsContent>
        </Tabs>
      </div>
    </EventsProvider>
  );
}
