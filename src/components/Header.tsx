import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0">
      <span className="text-sm font-medium">Todo app client</span>
      <ModeToggle />
    </header>
  );
}
