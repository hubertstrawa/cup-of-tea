import AvailabilityChecker from "@/components/availability-checker";
import Calendar from "@/components/calendar";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsProvider } from "@/components/context/events-context";

export default function CalendarWrapper() {
  return (
    <EventsProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-6">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="calendar" className="flex flex-col w-full">
            {/* <TabsList className="flex justify-center mb-2">
              <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
              <TabsTrigger value="schedulingAssistant">Scheduling Assistant</TabsTrigger>
            </TabsList> */}
            <TabsContent value="calendar" className="w-full space-y-6">
              {/* Enhanced header section */}
              <div className="text-center space-y-3 py-6">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Kalendarz Lekcji
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  Zarządzaj swoim harmonogramem lekcji. Aby uczniowie mogli zarezerwować termin, 
                  dodaj wydarzenie ze statusem <span className="font-semibold text-primary">"Dostępny"</span>
                </p>
              </div>

              <Separator className="my-6" />
              
              {/* Calendar component */}
              <Calendar />
            </TabsContent>
            
            <TabsContent value="schedulingAssistant" className="w-full space-y-6">
              <div className="text-center space-y-3 py-6">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Asystent Planowania
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                  Inteligentny asystent analizujący Twój harmonogram i automatycznie pokazujący wolne terminy.
                </p>
              </div>
              <Separator className="my-6" />
              <AvailabilityChecker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </EventsProvider>
  );
}
