import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import { SetupStep } from "../constants";
import { useEffect } from "react";

export interface SetupApproval {
  id: string;
  household_id: string;
  user_id: string;
  step: string;
  approved_at: string;
}

export interface EdgeCaseRule {
  id: string;
  household_id: string;
  prompt_id: string;
  description: string;
  resolved_category: string;
  notes: string | null;
}

export function useSetupApprovals(householdId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!householdId) return;
    const channel = supabase
      .channel(`approvals-${householdId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "setup_approvals", filter: `household_id=eq.${householdId}` },
        () => qc.invalidateQueries({ queryKey: ["setup_approvals", householdId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [householdId, qc]);

  return useQuery({
    queryKey: ["setup_approvals", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("setup_approvals")
        .select("*")
        .eq("household_id", householdId!);

      if (error) throw error;
      return data as SetupApproval[];
    },
  });
}

export function useApproveStep() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ householdId, step }: { householdId: string; step: SetupStep }) => {
      const { error } = await supabase.from("setup_approvals").insert({
        household_id: householdId,
        user_id: user!.id,
        step,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["setup_approvals"] }),
  });
}

export function useEdgeCaseRules(householdId: string | undefined) {
  return useQuery({
    queryKey: ["edge_case_rules", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edge_case_rules")
        .select("*")
        .eq("household_id", householdId!);

      if (error) throw error;
      return data as EdgeCaseRule[];
    },
  });
}

export function useSaveEdgeCaseRule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rule: {
      household_id: string;
      prompt_id: string;
      description: string;
      resolved_category: string;
    }) => {
      // Upsert by household + prompt_id
      const { data: existing } = await supabase
        .from("edge_case_rules")
        .select("id")
        .eq("household_id", rule.household_id)
        .eq("prompt_id", rule.prompt_id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("edge_case_rules")
          .update({ resolved_category: rule.resolved_category, agreed_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("edge_case_rules").insert(rule);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["edge_case_rules"] }),
  });
}

export function useCompleteSetup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (householdId: string) => {
      const { error } = await supabase
        .from("households")
        .update({ status: "active", setup_completed_at: new Date().toISOString() })
        .eq("id", householdId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
  });
}
