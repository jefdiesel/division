import { Navigate, Outlet } from "react-router-dom";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { useAuth } from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { AppShell } from "@/components/layout/AppShell";

export default function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const { data: householdData, isLoading: householdLoading } = useHousehold();

  if (authLoading || householdLoading) {
    return <Spinner className="min-h-screen" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!householdData?.household) {
    return <Navigate to="/create-household" replace />;
  }

  if (householdData.household.status !== "active") {
    return <Navigate to="/setup" replace />;
  }

  // AppShell includes the header and BottomNav already.
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
