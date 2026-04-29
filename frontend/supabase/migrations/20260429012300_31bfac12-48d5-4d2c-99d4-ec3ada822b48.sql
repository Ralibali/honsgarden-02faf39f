-- community_comments: admin update
CREATE POLICY "Admins can update any comment"
  ON public.community_comments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- community_reactions: admin delete (utöver egna)
CREATE POLICY "Admins can delete any reaction"
  ON public.community_reactions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- community_reports: admin delete
CREATE POLICY "Admins can delete reports"
  ON public.community_reports FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));