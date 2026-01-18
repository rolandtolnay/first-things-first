export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 p-8">
        {/* App title with JARVIS-style accent */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          First Things First
        </h1>

        {/* Subtitle with muted color */}
        <p className="max-w-md text-center text-lg text-muted-foreground">
          Put first things first. Organize your life into roles, set weekly
          goals, and schedule your priorities.
        </p>

        {/* Status indicator using theme colors */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-sm text-card-foreground">
            Project initialized
          </span>
        </div>

        {/* Theme color preview */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Theme Colors</p>
          <div className="flex gap-2">
            <div
              className="h-8 w-8 rounded bg-primary"
              title="Primary (Teal)"
            />
            <div className="h-8 w-8 rounded bg-secondary" title="Secondary" />
            <div className="h-8 w-8 rounded bg-accent" title="Accent" />
            <div className="h-8 w-8 rounded bg-muted" title="Muted" />
            <div
              className="h-8 w-8 rounded bg-destructive"
              title="Destructive"
            />
            <div className="h-8 w-8 rounded bg-success" title="Success" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-role-1" title="Role 1" />
            <div className="h-8 w-8 rounded bg-role-2" title="Role 2" />
            <div className="h-8 w-8 rounded bg-role-3" title="Role 3" />
            <div className="h-8 w-8 rounded bg-role-4" title="Role 4" />
            <div className="h-8 w-8 rounded bg-role-5" title="Role 5" />
            <div className="h-8 w-8 rounded bg-role-6" title="Role 6" />
            <div className="h-8 w-8 rounded bg-role-7" title="Role 7" />
            <div className="h-8 w-8 rounded bg-role-8" title="Role 8" />
          </div>
        </div>
      </main>
    </div>
  );
}
