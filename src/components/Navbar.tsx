import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Crown, User, Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const groupedNav = [
  {
    category: "The Studio",
    items: [
      { label: "Creation Center", href: "/creation-center" },
      { label: "Editing Suite", href: "/editing-suite" },
      { label: "Recording & Radio", href: "/recording-radio" },
      { label: "Studio Equipment", href: "/equipment" },
      { label: "Food Menu", href: "/food" },
    ]
  },
  {
    category: "Music & Shop",
    items: [
      { label: "Digital Vinyl", href: "/vinyl" },
      { label: "Mixtapes", href: "/mixtapes" },
      { label: "The Shop", href: "/shop" },
      { label: "My Clothing", href: "/artist-clothing", authRequired: true },
    ]
  },
  {
    category: "Community",
    items: [
      { label: "Artist Social Hub", href: "/artist-social-hub" },
      { label: "Collabo Board", href: "/community" },
      { label: "My Label", href: "/artist-label", authRequired: true },
      { label: "Street Team", href: "/street-team" },
      { label: "Social Feed", href: "/social-feed" },
    ]
  },
  {
    category: "Info",
    items: [
      { label: "Events", href: "/events" },
      { label: "Academy", href: "/academy" },
      { label: "Our Story", href: "/story" },
      { label: "Contact Us", href: "/contact" },
      { label: "Help Centre", href: "/help" },
    ]
  }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = role === "creator_admin";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[70] bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md border border-border/70 bg-background/80 text-muted-foreground transition-colors hover:text-interactive hover:border-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
              <Crown className="w-6 h-6 text-primary" />
              <span className="font-bebas text-2xl tracking-widest text-foreground hidden sm:inline-block">FULLY GOVERNED</span>
              <span className="font-bebas text-2xl tracking-widest text-foreground sm:hidden">FG</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/book" className="font-bebas text-sm sm:text-base tracking-wider bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] hover:border hover:border-interactive transition-all min-h-[40px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              BOOK
            </Link>

            {isAdmin && (
              <Link to="/admin" className="hidden sm:flex text-muted-foreground hover:text-interactive transition-colors min-h-[44px] min-w-[44px] items-center justify-center" title="Admin">
                <Shield className="w-5 h-5" />
              </Link>
            )}

            <Link to={user ? "/dashboard" : "/auth"} className="text-muted-foreground hover:text-interactive transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-7 h-7 rounded-full border border-border" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>

            <button
              className="text-foreground hover:text-interactive transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setOpen(!open)}
              aria-label="Toggle Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background border-b border-border overflow-y-auto pt-20 pb-24"
          >
            <div className="container max-w-5xl mx-auto">
              {/* Mobile Quick Links */}
              <div className="flex sm:hidden gap-2 mb-8 border-b border-border pb-6">
                <Link to="/book" className="flex-1 font-bebas text-lg tracking-wider bg-primary text-primary-foreground px-4 py-3 rounded-sm text-center">
                  BOOK NOW
                </Link>
                <Link to={user ? "/dashboard" : "/auth"} className="flex-1 font-bebas text-lg tracking-wider border border-border bg-card text-foreground px-4 py-3 rounded-sm text-center">
                  {user ? "DASHBOARD" : "SIGN IN"}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="w-12 border border-border bg-card text-foreground rounded-sm flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {/* Navigation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {groupedNav.map((group) => (
                  <div key={group.category} className="space-y-4">
                    <h3 className="font-bebas text-2xl text-primary tracking-wider border-b border-border pb-2">
                      {group.category}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.filter((item) => !item.authRequired || user).map((item) => (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className="group flex items-center justify-between font-barlow text-foreground hover:text-interactive py-1 transition-colors"
                          >
                            <span className="text-lg font-medium tracking-wide">{item.label}</span>
                            <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-interactive" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Bottom Footer Info */}
              <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground font-barlow text-sm">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary/50" />
                  <span>Fully Governed Studio © 2026</span>
                </div>
                <div className="flex gap-6">
                  <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                  <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                  <a href="mailto:info@fullygoverned.com" className="hover:text-foreground transition-colors">info@fullygoverned.com</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
