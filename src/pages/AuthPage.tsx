import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Spinner } from "@/components/ui/Spinner";

export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: householdLoading } = useHousehold();

  if (authLoading || (user && householdLoading)) {
    return <Spinner className="min-h-screen" />;
  }

  if (user) {
    if (!data?.household) return <Navigate to="/create-household" replace />;
    if (data.household.status === "pending_invite") return <Navigate to="/create-household" replace />;
    if (data.household.status === "setup_in_progress") return <Navigate to="/setup" replace />;
    return <Navigate to="/app" replace />;
  }

  return <AuthForm />;
}
