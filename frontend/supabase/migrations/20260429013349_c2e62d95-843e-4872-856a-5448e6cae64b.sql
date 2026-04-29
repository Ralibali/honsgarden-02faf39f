-- Community moderation log
CREATE TABLE public.community_moderation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moderator_id UUID NOT NULL,
  moderator_name TEXT,
  action TEXT NOT NULL, -- 'delete_post', 'delete_comment', 'pin', 'unpin', 'mark_sold', 'unmark_sold', 'edit_post', 'edit_comment'
  target_type TEXT NOT NULL, -- 'post' | 'comment'
  target_id UUID NOT NULL,
  target_user_id UUID,
  target_user_name TEXT,
  snapshot JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mod_log_created_at ON public.community_moderation_log(created_at DESC);
CREATE INDEX idx_mod_log_moderator ON public.community_moderation_log(moderator_id);
CREATE INDEX idx_mod_log_target ON public.community_moderation_log(target_type, target_id);

ALTER TABLE public.community_moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation log"
ON public.community_moderation_log FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert moderation log"
ON public.community_moderation_log FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND moderator_id = auth.uid());

CREATE POLICY "Admins can delete old log entries"
ON public.community_moderation_log FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));