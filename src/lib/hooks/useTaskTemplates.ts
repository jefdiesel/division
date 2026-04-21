import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { CategoryType, UnitType } from "../constants";
import { useEffect } from "react";

export interface TaskTemplate {
  id: string;
  household_id: string;
  name: string;
  category: CategoryType;
  unit: UnitType;
  default_value: number | null;
  weight: number;
  market_rate_usd_hr: number | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export function useTaskTemplates(householdId: string | undefined) {
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!householdId) return;
    const channel = supabase
      .channel(`tasks-${householdId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_templates", filter: `household_id=eq.${householdId}` },
        () => qc.invalidateQueries({ queryKey: ["task_templates", householdId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [householdId, qc]);

  return useQuery({
    queryKey: ["task_templates", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .eq("household_id", householdId!)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as TaskTemplate[];
    },
  });
}

export function useSeedTasks() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ householdId, tasks }: {
      householdId: string;
      tasks: Array<{
        name: string;
        category: CategoryType;
        unit: UnitType;
        default_value?: number;
        market_rate_usd_hr?: number;
        icon?: string;
      }>;
    }) => {
      const rows = tasks.map((t, i) => ({
        household_id: householdId,
        name: t.name,
        category: t.category,
        unit: t.unit,
        default_value: t.default_value || null,
        market_rate_usd_hr: t.market_rate_usd_hr || null,
        icon: t.icon || null,
        sort_order: i,
      }));

      const { error } = await supabase.from("task_templates").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task_templates"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskTemplate> & { id: string }) => {
      const { error } = await supabase
        .from("task_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task_templates"] }),
  });
}

export function useAddTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      household_id: string;
      name: string;
      category: CategoryType;
      unit: UnitType;
      default_value?: number;
      market_rate_usd_hr?: number;
      icon?: string;
    }) => {
      const { error } = await supabase.from("task_templates").insert({
        ...task,
        default_value: task.default_value || null,
        market_rate_usd_hr: task.market_rate_usd_hr || null,
        icon: task.icon || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task_templates"] }),
  });
}
