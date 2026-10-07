import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Crown, LayoutDashboard, CalendarDays, Users, PoundSterling, Wrench, Megaphone, Radio, ShoppingBag, FileText, Settings, LogOut, ChevronLeft, Car, MessageSquare, UserCheck, Shirt, BookOpen, ClipboardList, Mail, Inbox, Trophy, Disc3, ShieldCheck, Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canManageSettings } from "@/lib/studioRoles";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Bookings", icon: CalendarDays, path: "/admin/bookings" },
  { label: "Members", icon: Users, path: "/admin/members" },
  { label: "Artists", icon: Users, path: "/admin/artists" },
  { label: "Producers", icon: UserCheck, path: "/admin/producers" },
  { label: "Campaign Briefs", icon: ClipboardList, path: "/admin/campaign-briefs" },
  { label: "Task Board", icon: ClipboardList, path: "/admin/tasks" },
  { label: "Timesheets", icon: Clock, path: "/admin/timesheets" },
  { label: "Bans & Risk", icon: ShieldAlert, path: "/admin/bans" },
  { label: "Revenue", icon: PoundSterling, path: "/admin/revenue" },
  { label: "Loyalty Points", icon: Trophy, path: "/admin/loyalty-points" },
  { label: "Vinyl Vault", icon: Disc3, path: "/admin/vinyl-vault" },
  { label: "Enquiries", icon: MessageSquare, path: "/admin/enquiries" },
  { label: "Equipment", icon: Wrench, path: "/admin/equipment" },
  { label: "Events & Ads", icon: Megaphone, path: "/admin/events" },
  { label: "Radio", icon: Radio, path: "/admin/radio" },
  { label: "Shop", icon: ShoppingBag, path: "/admin/shop" },
  { label: "Street Team", icon: UserCheck, path: "/admin/street-team" },
  { label: "Clothing Orders", icon: Shirt, path: "/admin/clothing-orders" },
  { label: "Collabo Board", icon: Users, path: "/admin/collabo" },
  { label: "Session Log", icon: FileText, path: "/admin/session-log" },
  { label: "Sign-In Sheet", icon: ClipboardList, path: "/admin/sign-in" },
  { label: "Help Centre", icon: BookOpen, path: "/admin/help-centre" },
  { label: "Email Log", icon: Mail, path: "/admin/email-log" },
  { label: "Contact Messages", icon: Inbox, path: "/admin/contact-messages" },
  { label: "Vehicles", icon: Car, path: "/admin/vehicles" },
  { label: "Staff Roles", icon: ShieldCheck, path: "/admin/staff-roles" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const AdminLayout = () => {
  const { user, studioRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !canManageSettings(studioRole))) {
      navigate("/");
    }
  }, [loading, user, studioRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Crown className="w-8 h-8 text-primary animate-pulse-gold" />
      </div>
    );
  }

  if (!user || !canManageSettings(studioRole)) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <span className="font-bebas text-xl tracking-widest text-foreground">CREATOR ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-barlow transition-all ${active ? "text-interactive bg-interactive/10 border-r-2 border-interactive" : "text-muted-foreground hover:text-interactive hover:bg-accent/50"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-interactive transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen lg:ml-64">
        <div className="grain-overlay" />
        <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto px-4 py-3">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-barlow transition-colors ${active ? "border-interactive bg-interactive/10 text-interactive" : "border-border text-muted-foreground"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
