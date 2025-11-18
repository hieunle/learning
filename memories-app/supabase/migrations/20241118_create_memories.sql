-- Create memories table
create table memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table memories enable row level security;

-- Create policies
-- Users can only see their own memories
create policy "Users can view own memories" on memories
  for select using (auth.uid() = user_id);

-- Users can insert their own memories
create policy "Users can insert own memories" on memories
  for insert with check (auth.uid() = user_id);

-- Users can update their own memories
create policy "Users can update own memories" on memories
  for update using (auth.uid() = user_id);

-- Users can delete their own memories
create policy "Users can delete own memories" on memories
  for delete using (auth.uid() = user_id);

-- Grant permissions
grant all on memories to authenticated;
grant select on memories to anon;