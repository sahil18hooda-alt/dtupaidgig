-- Fix: Allow users to update conversations they are part of
-- This is required for the "Assign Gig" feature to work, as it updates the conversation status.

create policy "Users can update their own conversations."
  on public.conversations for update
  using ( auth.uid() = requester_id or auth.uid() = solver_id );
