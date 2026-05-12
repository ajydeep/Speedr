import { BookOpenText, Clock3, Info, Library, Settings2 } from "lucide-react";

const navItems = [
  { label: "Library", icon: Library },
  { label: "Paste Text", icon: BookOpenText },
  { label: "Settings", icon: Settings2 },
  { label: "Sessions", icon: Clock3 },
  { label: "About RSVP", icon: Info },
];

type SidebarProps = {
  currentWpm: number;
  wordsCompleted: number;
  totalWords: number;
};

export function Sidebar({ currentWpm, wordsCompleted, totalWords }: SidebarProps) {
  return (
    <section className="space-y-6 rounded-xl border border-border/70 bg-surface/60 p-4">
      <div>
        <p className="font-[var(--font-playfair)] text-xl tracking-tight">Speedr</p>
        <p className="mt-1 text-sm text-muted-foreground">RSVP speed reading studio</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-foreground/6 hover:text-foreground"
            type="button"
          >
            <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="rounded-lg border border-border/70 bg-background/60 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Session</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Speed</dt>
            <dd>{currentWpm} WPM</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Progress</dt>
            <dd>
              {wordsCompleted}/{Math.max(totalWords, 1)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
