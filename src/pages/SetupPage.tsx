import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { SetupWizard } from "@/components/setup/SetupWizard";
import { Spinner } from "@/components/ui/Spinner";

export function SetupPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading: householdLoading } = useHousehold();
  const navigate = useNavigate();

  const household = data?.household;
  const members = data?.members ?? [];

  // Redirect conditions
  useEffect(() => {
    if (authLoading || householdLoading) return;

    // Not logged in
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // No household found
    if (!household) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // Setup already completed -- go to app
    if (household.status === "active") {
      navigate("/app", { replace: true });
      return;
    }

    // Still waiting for partner to join
    if (household.status === "pending_invite") {
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, household, authLoading, householdLoading, navigate]);

  if (authLoading || householdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <Spinner />
      </div>
    );
  }

  // Guard: only render wizard when status is correct
  if (!household || household.status !== "setup_in_progress") {
    return null;
  }

  return <SetupWizard householdId={household.id} members={members} />;
}
