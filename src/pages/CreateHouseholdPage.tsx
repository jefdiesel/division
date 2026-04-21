import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHousehold, useCreateHousehold, useInvitePartner } from "@/lib/hooks/useHousehold";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function CreateHouseholdPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useHousehold();
  const navigate = useNavigate();
  const createHousehold = useCreateHousehold();
  const invitePartner = useInvitePartner();

  const [step, setStep] = useState<"create" | "invite" | "waiting">("create");
  const [displayName, setDisplayName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [error, setError] = useState("");

  if (authLoading || isLoading) return <Spinner className="min-h-screen" />;
  if (!user) return <Navigate to="/auth" replace />;

  if (data?.household) {
    if (data.household.status === "setup_in_progress") return <Navigate to="/setup" replace />;
    if (data.household.status === "active") return <Navigate to="/app" replace />;
    // pending_invite — show waiting
    if (step === "create") setStep("waiting");
  }

  const handleCreate = async () => {
    if (!displayName.trim()) return;
    setError("");
    try {
      const h = await createHousehold.mutateAsync({ displayName: displayName.trim() });
      setHouseholdId(h.id);
      setStep("invite");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create household");
    }
  };

  const handleInvite = async () => {
    if (!partnerEmail.trim()) return;
    setError("");
    try {
      const invite = await invitePartner.mutateAsync({
        householdId,
        email: partnerEmail.trim(),
      });
      setInviteLink(`${window.location.origin}/invite/${invite.token}`);
      setStep("waiting");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  // Poll for partner joining
  const { data: freshData } = useHousehold();
  if (freshData?.household?.status === "setup_in_progress") {
    navigate("/setup");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-warm-50">
      <Card className="max-w-md w-full p-6 space-y-5">
        {step === "create" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-bark">Welcome to Division</h1>
              <p className="text-sm text-sand-700 mt-1">Let's set up your household</p>
            </div>
            <Input
              label="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              autoFocus
            />
            {error && <p className="text-sm text-warm-700">{error}</p>}
            <Button size="lg" className="w-full" disabled={!displayName.trim()} onClick={handleCreate}>
              Continue
            </Button>
          </>
        )}

        {step === "invite" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-bark">Invite your co-parent</h1>
              <p className="text-sm text-sand-700 mt-1">
                Division only works when both parents set it up together
              </p>
            </div>
            <Input
              label="Partner's email"
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder="their@email.com"
              autoFocus
            />
            {error && <p className="text-sm text-warm-700">{error}</p>}
            <Button size="lg" className="w-full" disabled={!partnerEmail.trim()} onClick={handleInvite}>
              Send invite
            </Button>
          </>
        )}

        {step === "waiting" && (
          <div className="text-center py-8 space-y-4">
            <Spinner />
            <h2 className="text-lg font-semibold text-bark">Waiting for your partner</h2>
            <p className="text-sm text-sand-700">
              Send them this link to join:
            </p>
            {inviteLink && (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3 py-2 rounded-lg border border-sand-200 bg-sand-50 text-xs text-sand-800 truncate"
                />
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
              </div>
            )}
            <p className="text-xs text-sand-500">
              This page will update automatically when they join
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
