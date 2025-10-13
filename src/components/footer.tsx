import { DarkModeToggle } from "./dark-mode-toggle";
import { Separator } from "./ui/separator";

export default function Footer() {
  return (
    <div className="space-y-4 px-5 pb-5 text-xs md:text-sm">
      <Separator />
      <div className="flex flex-wrap items-center justify-between">
        <p>Cup of tea</p>

        <DarkModeToggle />
      </div>
    </div>
  );
}
