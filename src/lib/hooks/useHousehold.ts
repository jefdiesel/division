import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";

export interface Household {
  id: string;
  name: string | null;
  status: "pending_invite" | "setup_in_progress" | "active";
  setup_completed_at: string | null;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  display_name: string;
}

export function useHousehold() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["household", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: member } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user!.id)
        .single();

      if (!member) return null;

      const { data: household } = await supabase
        .from("households")
        .select("*")
        .eq("id", member.household_id)
        .single();

      const { data: members } = await supabase
        .from("household_members")
        .select("*")
        .eq("household_id", member.household_id);

      return {
        household: household as Household,
        members: (members || []) as HouseholdMember[],
      };
    },
  });
}

export function useCreateHousehold() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, householdName }: { displayName: string; householdName?: string }) => {
      const { data: household, error: hErr } = await supabase
        .from("households")
        .insert({ name: householdName || null })
        .select()
        .single();

      if (hErr) throw hErr;

      const { error: mErr } = await supabase
        .from("household_members")
        .insert({
          household_id: household.id,
          user_id: user!.id,
          display_name: displayName,
        });

      if (mErr) throw mErr;
      return household;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
  });
}

export function useInvitePartner() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ householdId, email }: { householdId: string; email: string }) => {
      const { data, error } = await supabase
        .from("invites")
        .insert({
          household_id: householdId,
          invited_by: user!.id,
          invited_email: email.toLowerCase().trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useAcceptInvite() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, displayName }: { token: string; displayName: string }) => {
      // Find the invite
      const { data: invite, error: iErr } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .is("accepted_at", null)
        .single();

      if (iErr || !invite) throw new Error("Invite not found or already used");

      // Add self to household
      const { error: mErr } = await supabase
        .from("household_members")
        .insert({
          household_id: invite.household_id,
          user_id: user!.id,
          display_name: displayName,
        });

      if (mErr) throw mErr;

      // Mark invite accepted
      await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      // Update household status
      await supabase
        .from("households")
        .update({ status: "setup_in_progress" })
        .eq("id", invite.household_id);

      return invite;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
  });
}
