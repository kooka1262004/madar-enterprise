
-- Fix overly permissive notifications INSERT policy
DROP POLICY "Anyone authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
