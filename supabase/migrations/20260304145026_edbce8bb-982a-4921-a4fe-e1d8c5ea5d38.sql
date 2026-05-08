
-- Equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  purchase_date DATE,
  pac_test_date DATE,
  insurance_expiry DATE,
  condition_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment viewable by everyone" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Family can manage equipment" ON public.equipment FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  ticket_price NUMERIC(10,2) DEFAULT 0,
  max_capacity INTEGER DEFAULT 50,
  rsvp_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Family can manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Shop items table
CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_count INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'merchandise',
  image_url TEXT,
  artist_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop items viewable by everyone" ON public.shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "Family can manage shop items" ON public.shop_items FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.shop_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'family'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Family can manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Session log (admin notes/walk-ins beyond bookings)
CREATE TABLE public.session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  user_id UUID,
  member_name TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT,
  end_time TEXT,
  session_type TEXT,
  duration_hours NUMERIC(4,1),
  guests INTEGER DEFAULT 0,
  engineer TEXT,
  notes TEXT,
  admin_notes TEXT,
  revenue NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family can view session logs" ON public.session_logs FOR SELECT USING (public.has_role(auth.uid(), 'family') OR auth.uid() = user_id);
CREATE POLICY "Family can manage session logs" ON public.session_logs FOR ALL USING (public.has_role(auth.uid(), 'family'));

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RSVPs" ON public.event_rsvps FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'family'));
CREATE POLICY "Users can create RSVPs" ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Family can manage RSVPs" ON public.event_rsvps FOR ALL USING (public.has_role(auth.uid(), 'family'));
