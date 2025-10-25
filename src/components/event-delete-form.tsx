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
  onDeleteSuccess?: () => void;
}

export function EventDeleteForm({ id, title, onDeleteSuccess }: EventDeleteFormProps) {
  const { deleteEvent } = useEvents();
  const { eventDeleteOpen, setEventDeleteOpen, setEventViewOpen } = useEvents();

  const { toast } = useToast();

  async function onSubmit() {
    try {
      // Call API to delete the event
      const response = await fetch(`/api/dates/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast({
          title: "Błąd!",
          description: "Nie udało się usunąć wydarzenia. Spróbuj ponownie.",
          variant: "destructive",
          action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
        });
        return;
      }

      // Update local state only after successful API call
      deleteEvent(id);
      setEventDeleteOpen(false);

      // Call custom success callback or fallback to closing event view
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        setEventViewOpen(false);
      }

      toast({
        title: "Wydarzenie usunięte!",
        variant: "default",
        action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
      });
    } catch {
      toast({
        title: "Błąd!",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
        action: <ToastAction altText={"Kliknij, aby zamknąć powiadomienie"}>Zamknij</ToastAction>,
      });
    }
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
