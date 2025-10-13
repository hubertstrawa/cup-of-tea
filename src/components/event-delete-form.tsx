import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEvents } from "@/components/context/events-context";
import { ToastAction } from "./ui/toast";
import { TrashIcon } from "@radix-ui/react-icons";
interface EventDeleteFormProps {
  id: string;
  title?: string;
}

export function EventDeleteForm({ id, title }: EventDeleteFormProps) {
  const { deleteEvent } = useEvents();
  const { eventDeleteOpen, setEventDeleteOpen, setEventViewOpen } = useEvents();

  const { toast } = useToast();

  async function onSubmit() {
    deleteEvent(id);
    setEventDeleteOpen(false);
    setEventViewOpen(false);
    toast({
      title: "Wydarzenie usunięte",
      action: <ToastAction altText={"Dismiss notification."}>Zamknij</ToastAction>,
    });
  }

  return (
    <AlertDialog open={eventDeleteOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={() => setEventDeleteOpen(true)}>
          <TrashIcon /> Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex flex-row justify-between items-center">
            <h1>Usuń {title}</h1>
          </AlertDialogTitle>
          Czy na pewno chcesz usunąć to wydarzenie?
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setEventDeleteOpen(false)}>
            {/* <Cross1Icon className="mr-2" /> Zamknij */}
            Zamknij
          </AlertDialogCancel>
          <Button variant="destructive" onClick={() => onSubmit()}>
            <TrashIcon /> Usuń
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
