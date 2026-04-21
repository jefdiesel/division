import { FormEvent, useState } from "react";
import { useCreateHousehold } from "@/lib/hooks/useHousehold";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { InvitePartner } from "./InvitePartner";

export function CreateHousehold() {
  const createHousehold = useCreateHousehold();
  const [displayName, setDisplayName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await createHousehold.mutateAsync({
      displayName,
      householdName: householdName || undefined,
    });
    setHouseholdId(result.id);
  };

  if (householdId) {
    return <InvitePartner householdId={householdId} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-warm-50">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-bark text-center mb-1">
          Set up your household
        </h1>
        <p className="text-sm text-sand-600 text-center mb-6">
          Tell us a bit about yourself so your partner knows who they're splitting with.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your display name"
            required
            placeholder="e.g. Alex"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Household name (optional)"
            placeholder="e.g. The Garcias"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
          />

          {createHousehold.error && (
            <p className="text-sm text-warm-700 bg-warm-100 rounded-lg px-3 py-2">
              {(createHousehold.error as Error).message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={createHousehold.isPending}
            className="w-full"
          >
            {createHousehold.isPending ? "Creating..." : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
