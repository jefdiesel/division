import { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-display font-semibold text-bark tracking-tight italic">
            Division
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-24">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
