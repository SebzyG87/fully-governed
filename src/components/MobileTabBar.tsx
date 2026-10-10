import { Home, Calendar, LayoutDashboard, Images, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const TAB_BREAKPOINT = 1024;

const HIDDEN_PATHS = ["/auth", "/unlock"];

const MobileTabBar = () => {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const tabs = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Book", icon: Calendar, path: "/book" },
    { label: "Gallery", icon: Images, path: "/360-tour" },
    { label: user ? "Dashboard" : "Sign In", icon: user ? LayoutDashboard : HelpCircle, path: user ? "/dashboard" : "/auth" },
    { label: "Help", icon: HelpCircle, path: "/help" },
  ];

  useEffect(() => {
    const check = () => setShow(window.innerWidth < TAB_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!show) return null;
  if (pathname.startsWith("/admin") || HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-1 flex-col items-center justify-center min-h-[52px] min-w-[44px] px-2 gap-0.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full blur-[2px] shadow-[0_0_8px_hsl(var(--primary))]" />
              )}
              <tab.icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
              <span className="text-[10px] font-mono font-bold tracking-tight">{tab.label.toUpperCase()}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
