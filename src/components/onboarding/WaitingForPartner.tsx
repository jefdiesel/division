import { useEffect } from "react";
import { useHousehold } from "@/lib/hooks/useHousehold";
import { Spinner } from "@/components/ui/Spinner";

interface WaitingForPartnerProps {
  email: string;
  onReady?: () => void;
}

export function WaitingForPartner({ email, onReady }: WaitingForPartnerProps) {
  const { data, isLoading, refetch } = useHousehold();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Trigger navigation when household status advances past pending_invite
  useEffect(() => {
    if (
      data?.household?.status &&
      data.household.status !== "pending_invite" &&
      onReady
    ) {
      onReady();
    }
  }, [data?.household?.status, onReady]);

  if (isLoading) {
    return <Spinner className="py-4" />;
  }

  return (
    <div className="text-center py-4">
      <Spinner className="mb-4" />
      <p className="text-sm text-bark font-medium">
        Waiting for {email} to join...
      </p>
      <p className="text-xs text-sand-500 mt-2">
        We'll move forward automatically once they accept.
      </p>
    </div>
  );
}
