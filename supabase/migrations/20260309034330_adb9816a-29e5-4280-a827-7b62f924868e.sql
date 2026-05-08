
-- Street Team Applications
CREATE TABLE public.street_team_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.street_team_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit application" ON public.street_team_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own applications" ON public.street_team_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Family can manage applications" ON public.street_team_applications FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Street Team Tasks
CREATE TABLE public.street_team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.street_team_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks viewable by authenticated" ON public.street_team_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Family can manage tasks" ON public.street_team_tasks FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Street Team Task Completions
CREATE TABLE public.street_team_task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.street_team_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.street_team_task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit completions" ON public.street_team_task_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own completions" ON public.street_team_task_completions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'family'));
CREATE POLICY "Family can manage completions" ON public.street_team_task_completions FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Street Team Rewards
CREATE TABLE public.street_team_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.street_team_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards viewable by authenticated" ON public.street_team_rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Family can manage rewards" ON public.street_team_rewards FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Follows
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Direct Messages
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view own messages" ON public.direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can update own received messages" ON public.direct_messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Enable realtime for DMs
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Clothing Products
CREATE TABLE public.clothing_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  design_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clothing_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.clothing_products FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'family'));
CREATE POLICY "Users can create products" ON public.clothing_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.clothing_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Family can manage products" ON public.clothing_products FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Clothing Orders
CREATE TABLE public.clothing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  product_id UUID REFERENCES public.clothing_products(id) ON DELETE SET NULL,
  artist_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  size TEXT,
  shipping_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clothing_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.clothing_orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = artist_id OR public.has_role(auth.uid(), 'family'));
CREATE POLICY "Users can create orders" ON public.clothing_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Family can manage orders" ON public.clothing_orders FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Help Articles (DB-backed)
CREATE TABLE public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles viewable by everyone" ON public.help_articles FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'family'));
CREATE POLICY "Family can manage articles" ON public.help_articles FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Email Logs
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family can view email logs" ON public.email_logs FOR SELECT USING (public.has_role(auth.uid(), 'family'));
CREATE POLICY "System can insert logs" ON public.email_logs FOR INSERT WITH CHECK (true);
