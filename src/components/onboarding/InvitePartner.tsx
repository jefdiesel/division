import { FormEvent, useState } from "react";
import { useInvitePartner } from "@/lib/hooks/useHousehold";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { WaitingForPartner } from "./WaitingForPartner";

interface InvitePartnerProps {
  householdId: string;
}

export function InvitePartner({ householdId }: InvitePartnerProps) {
  const invitePartner = useInvitePartner();
  const [email, setEmail] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await invitePartner.mutateAsync({
      householdId,
      email,
    });
    setInviteToken(result.token);
  };

  const inviteLink = inviteToken
    ? `${window.location.origin}/invite/${inviteToken}`
    : null;

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-warm-50">
        <Card className="w-full max-w-sm p-6">
          <h1 className="text-2xl font-bold text-bark text-center mb-1">
            Invite sent!
          </h1>
          <p className="text-sm text-sand-600 text-center mb-6">
            Share this link with your partner to join the household.
          </p>

          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-sand-500 font-medium mb-1">Invite link</p>
            <p className="text-sm text-bark break-all">{inviteLink}</p>
          </div>

          <Button
            onClick={copyLink}
            variant="secondary"
            size="md"
            className="w-full mb-6"
          >
            {copied ? "Copied!" : "Copy link"}
          </Button>

          <WaitingForPartner email={email} />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-warm-50">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-bark text-center mb-1">
          Invite your partner
        </h1>
        <p className="text-sm text-sand-600 text-center mb-6">
          Division works best as a team. Send an invite so you can both start tracking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Partner's email"
            type="email"
            required
            placeholder="partner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {invitePartner.error && (
            <p className="text-sm text-warm-700 bg-warm-100 rounded-lg px-3 py-2">
              {(invitePartner.error as Error).message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={invitePartner.isPending}
            className="w-full"
          >
            {invitePartner.isPending ? "Sending..." : "Send Invite"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
