import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface Entry {
  id: string;
  household_id: string;
  user_id: string;
  task_template_id: string;
  value: number;
  note: string | null;
  logged_at: string;
  created_at: string;
  // joined
  task_templates?: {
    name: string;
    category: string;
    unit: string;
    icon: string | null;
    market_rate_usd_hr: number | null;
  };
  disputes?: Array<{ id: string; flagged_by: string; reason: string | null }>;
}

export function useEntries(householdId: string | undefined, since?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!householdId) return;
    const channel = supabase
      .channel(`entries-${householdId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entries", filter: `household_id=eq.${householdId}` },
        () => qc.invalidateQueries({ queryKey: ["entries", householdId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [householdId, qc]);

  return useQuery({
    queryKey: ["entries", householdId, since],
    enabled: !!householdId,
    queryFn: async () => {
      let query = supabase
        .from("entries")
        .select("*, task_templates(name, category, unit, icon, market_rate_usd_hr), disputes(*)")
        .eq("household_id", householdId!)
        .order("logged_at", { ascending: false });

      if (since) {
        query = query.gte("logged_at", since);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Entry[];
    },
  });
}

export function useCreateEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      household_id: string;
      task_template_id: string;
      value: number;
      note?: string;
    }) => {
      const { error } = await supabase.from("entries").insert({
        ...entry,
        user_id: user!.id,
        note: entry.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase.from("entries").delete().eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useCreateDispute() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, reason }: { entryId: string; reason?: string }) => {
      const { error } = await supabase.from("disputes").insert({
        entry_id: entryId,
        flagged_by: user!.id,
        reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useRetractDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      const { error } = await supabase.from("disputes").delete().eq("id", disputeId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });
}
