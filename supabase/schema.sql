-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  rating_as_buyer float default 0,
  rating_as_seller float default 0,
  total_gigs_completed int default 0,
  created_at timestamptz default now()
);

-- Enable RLS for users
alter table public.users enable row level security;

-- Policies for users
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- GIGS TABLE
create table public.gigs (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references public.users(id) not null,
  title text not null,
  description text not null,
  category text not null, -- 'Lab File', 'Assignment', 'Project', 'Coding', 'Other'
  deadline timestamptz not null,
  price int not null,
  attachment_url text,
  status text default 'Open', -- 'Open', 'Assigned', 'Completed'
  created_at timestamptz default now()
);

-- Enable RLS for gigs
alter table public.gigs enable row level security;

-- Policies for gigs
create policy "Gigs are viewable by everyone."
  on public.gigs for select
  using ( true );

create policy "Users can create gigs."
  on public.gigs for insert
  with check ( auth.uid() = created_by );

create policy "Users can update own gigs."
  on public.gigs for update
  using ( auth.uid() = created_by );

-- CONVERSATIONS TABLE
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  gig_id uuid references public.gigs(id) not null,
  requester_id uuid references public.users(id) not null,
  solver_id uuid references public.users(id) not null,
  status text default 'Active', -- 'Active', 'Accepted', 'Closed'
  created_at timestamptz default now()
);

-- Enable RLS for conversations
alter table public.conversations enable row level security;

-- Policies for conversations
create policy "Users can view their own conversations."
  on public.conversations for select
  using ( auth.uid() = requester_id or auth.uid() = solver_id );

create policy "Users can create conversations."
  on public.conversations for insert
  with check ( auth.uid() = requester_id or auth.uid() = solver_id );

-- MESSAGES TABLE
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) not null,
  sender_id uuid references public.users(id) not null,
  content text not null,
  is_offer boolean default false,
  offer_price int,
  created_at timestamptz default now()
);

-- Enable RLS for messages
alter table public.messages enable row level security;

-- Policies for messages
create policy "Users can view messages in their conversations."
  on public.messages for select
  using ( exists (
    select 1 from public.conversations
    where id = conversation_id
    and (requester_id = auth.uid() or solver_id = auth.uid())
  ));

create policy "Users can insert messages in their conversations."
  on public.messages for insert
  with check ( exists (
    select 1 from public.conversations
    where id = conversation_id
    and (requester_id = auth.uid() or solver_id = auth.uid())
  ));

-- REVIEWS TABLE
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  gig_id uuid references public.gigs(id) not null,
  reviewer_id uuid references public.users(id) not null,
  reviewee_id uuid references public.users(id) not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Enable RLS for reviews
alter table public.reviews enable row level security;

-- Policies for reviews
create policy "Reviews are viewable by everyone."
  on public.reviews for select
  using ( true );

create policy "Users can create reviews."
  on public.reviews for insert
  with check ( auth.uid() = reviewer_id );

-- TRIGGER to create user profile on signup (Optional but recommended)
-- This function handles new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKETS
-- Create a bucket for 'gig-attachments'
insert into storage.buckets (id, name, public) values ('gig-attachments', 'gig-attachments', true);

-- Policy to allow authenticated users to upload files
create policy "Authenticated users can upload files"
on storage.objects for insert
with check ( bucket_id = 'gig-attachments' and auth.role() = 'authenticated' );

-- Policy to allow everyone to view files
create policy "Everyone can view files"
on storage.objects for select
using ( bucket_id = 'gig-attachments' );
