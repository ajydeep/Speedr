import { SpeedrLogo } from "@/components/SpeedrLogo";
import { Reader } from "@/components/Reader";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.08),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(20,27,45,0.11),transparent_42%)]" />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-6 pt-4 sm:px-8 sm:pt-6 lg:px-12">
        <section className="mb-4 flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SpeedrLogo compact />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Speedr</p>
              <p className="text-sm text-muted-foreground">Your brain reads faster than your eyes.</p>
            </div>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
            RSVP speed reading studio
          </p>
        </section>

        <section className="flex-1">
          <Reader />
        </section>

      </main>
    </div>
  );
}
