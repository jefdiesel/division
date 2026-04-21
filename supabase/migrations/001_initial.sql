-- Enums
CREATE TYPE category_type AS ENUM ('childcare', 'household', 'coverage');
CREATE TYPE unit_type AS ENUM ('count', 'minutes', 'hours');
CREATE TYPE setup_status AS ENUM ('pending_invite', 'setup_in_progress', 'active');
CREATE TYPE change_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Households
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  status setup_status NOT NULL DEFAULT 'pending_invite',
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Household members
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Invites
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(token)
);

-- Task templates
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category category_type NOT NULL,
  unit unit_type NOT NULL,
  default_value INTEGER,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  market_rate_usd_hr NUMERIC(8,2),
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Edge case rules
CREATE TABLE edge_case_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  description TEXT NOT NULL,
  resolved_category category_type NOT NULL,
  notes TEXT,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Setup approvals
CREATE TABLE setup_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  step TEXT NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id, step)
);

-- Entries
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  task_template_id UUID NOT NULL REFERENCES task_templates(id),
  value INTEGER NOT NULL,
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entry_id, flagged_by)
);

-- Ruleset change requests
CREATE TABLE ruleset_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  change_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status change_request_status NOT NULL DEFAULT 'pending',
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_entries_household_logged ON entries(household_id, logged_at DESC);
CREATE INDEX idx_entries_user ON entries(user_id, logged_at DESC);
CREATE INDEX idx_task_templates_household ON task_templates(household_id);
CREATE INDEX idx_disputes_entry ON disputes(entry_id);
CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(invited_email);

-- Helper function
CREATE OR REPLACE FUNCTION user_household_id()
RETURNS UUID AS $$
  SELECT household_id FROM household_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==================
-- RLS Policies
-- ==================

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_case_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruleset_change_requests ENABLE ROW LEVEL SECURITY;

-- Households: members can read and update
CREATE POLICY "Members can view household" ON households
  FOR SELECT USING (id = user_household_id());
CREATE POLICY "Members can update household" ON households
  FOR UPDATE USING (id = user_household_id());
CREATE POLICY "Authenticated users can create household" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Household members: members of same household can see each other
CREATE POLICY "Members can view members" ON household_members
  FOR SELECT USING (household_id = user_household_id());
CREATE POLICY "Can add self to household" ON household_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Invites
CREATE POLICY "Inviter can view invites" ON invites
  FOR SELECT USING (invited_by = auth.uid() OR household_id = user_household_id());
CREATE POLICY "Members can create invites" ON invites
  FOR INSERT WITH CHECK (household_id = user_household_id());
CREATE POLICY "Invited user can update invite" ON invites
  FOR UPDATE USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Task templates: household members
CREATE POLICY "Members can view tasks" ON task_templates
  FOR SELECT USING (household_id = user_household_id());
CREATE POLICY "Members can create tasks" ON task_templates
  FOR INSERT WITH CHECK (household_id = user_household_id());
CREATE POLICY "Members can update tasks" ON task_templates
  FOR UPDATE USING (household_id = user_household_id());

-- Edge case rules: household members
CREATE POLICY "Members can view edge cases" ON edge_case_rules
  FOR SELECT USING (household_id = user_household_id());
CREATE POLICY "Members can create edge cases" ON edge_case_rules
  FOR INSERT WITH CHECK (household_id = user_household_id());
CREATE POLICY "Members can update edge cases" ON edge_case_rules
  FOR UPDATE USING (household_id = user_household_id());

-- Setup approvals: can only approve for yourself
CREATE POLICY "Members can view approvals" ON setup_approvals
  FOR SELECT USING (household_id = user_household_id());
CREATE POLICY "Can approve for self" ON setup_approvals
  FOR INSERT WITH CHECK (user_id = auth.uid() AND household_id = user_household_id());

-- Entries: self-log only (the critical policy)
CREATE POLICY "Members can view entries" ON entries
  FOR SELECT USING (household_id = user_household_id());
CREATE POLICY "Self log only" ON entries
  FOR INSERT WITH CHECK (user_id = auth.uid() AND household_id = user_household_id());
CREATE POLICY "Can delete own entries" ON entries
  FOR DELETE USING (user_id = auth.uid());

-- Disputes: can only dispute the other parent's entries
CREATE POLICY "Members can view disputes" ON disputes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM entries e WHERE e.id = entry_id AND e.household_id = user_household_id())
  );
CREATE POLICY "Can dispute other entries" ON disputes
  FOR INSERT WITH CHECK (
    flagged_by = auth.uid() AND
    EXISTS (SELECT 1 FROM entries e WHERE e.id = entry_id AND e.user_id != auth.uid())
  );
CREATE POLICY "Can retract own dispute" ON disputes
  FOR DELETE USING (flagged_by = auth.uid());

-- Change requests
CREATE POLICY "Members can view changes" ON ruleset_change_requests
  FOR SELECT USING (household_id = user_household_id());
CREATE POLICY "Members can propose changes" ON ruleset_change_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid() AND household_id = user_household_id());
CREATE POLICY "Other member can respond" ON ruleset_change_requests
  FOR UPDATE USING (
    household_id = user_household_id() AND requested_by != auth.uid()
  );
