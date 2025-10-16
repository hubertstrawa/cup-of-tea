import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CalendarEvent } from "@/components/utils-front/data";
import { EventDeleteForm } from "./event-delete-form";
import { EventEditForm } from "./event-edit-form";
import { useEvents } from "@/components/context/events-context";
import { X } from "lucide-react";

interface EventViewProps {
  event?: CalendarEvent;
}

export function EventView({ event }: EventViewProps) {
  const { eventViewOpen, setEventViewOpen } = useEvents();
  console.log(event);

  return (
    <>
      <AlertDialog open={eventViewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-row justify-between items-center">
              <h1>{event?.title}</h1>
              <AlertDialogCancel onClick={() => setEventViewOpen(false)}>
                <X className="h-5 w-5" />
              </AlertDialogCancel>
            </AlertDialogTitle>
            <table>
              <tr>
                <th>Godzina:</th>
                <td>
                  {`${event?.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event?.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </td>
              </tr>
              <tr>
                <th>Opis:</th>
                <td>{event?.description}</td>
              </tr>
              <tr>
                <th>Status:</th>
                <td>{event?.dateStatus}</td>
              </tr>
              {/* <tr>
                <th>Color:</th>
                <td>
                  <div className="rounded-full w-5 h-5" style={{ backgroundColor: event?.backgroundColor }}></div>
                </td>
              </tr> */}
            </table>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <EventDeleteForm id={event?.id ?? ""} title={event?.title ?? ""} />
            <EventEditForm
              closeEventView={() => setEventViewOpen(false)}
              oldEvent={event}
              event={event}
              isDrag={false}
              displayButton={true}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
