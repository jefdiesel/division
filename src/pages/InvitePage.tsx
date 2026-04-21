import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAcceptInvite } from "@/lib/hooks/useHousehold";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const acceptInvite = useAcceptInvite();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  if (loading) return <Spinner className="min-h-screen" />;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-warm-50">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-bark">You've been invited</h1>
          <p className="text-sm text-sand-700 mt-1">Sign up or log in to accept</p>
        </div>
        <AuthForm />
      </div>
    );
  }

  const handleAccept = async () => {
    if (!displayName.trim() || !token) return;
    setError("");
    try {
      await acceptInvite.mutateAsync({ token, displayName: displayName.trim() });
      navigate("/setup");
    } catch (e) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      console.error("Accept invite error:", e);
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-warm-50">
      <Card className="max-w-md w-full p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-bark">Join household</h1>
          <p className="text-sm text-sand-700 mt-1">Your partner invited you to Division</p>
        </div>
        <Input
          label="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What should we call you?"
          autoFocus
        />
        {error && <p className="text-sm text-warm-700">{error}</p>}
        <Button
          size="lg"
          className="w-full"
          disabled={!displayName.trim() || acceptInvite.isPending}
          onClick={handleAccept}
        >
          {acceptInvite.isPending ? "Joining..." : "Accept and join"}
        </Button>
      </Card>
    </div>
  );
}
