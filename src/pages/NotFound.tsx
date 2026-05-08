import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="grain-overlay" />

      {/* Neon glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-interactive/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 text-center px-4">
        {/* Floating crown */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mb-6"
        >
          <Crown className="w-16 h-16 text-primary mx-auto drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-bebas text-[8rem] md:text-[12rem] leading-none text-foreground tracking-wider drop-shadow-[0_0_40px_hsl(var(--interactive)/0.3)]">
            404
          </h1>
          <p className="font-barlow text-xl text-muted-foreground mb-2">This page doesn't exist</p>
          <p className="font-mono text-xs text-muted-foreground/60 tracking-wider mb-8">
            ROUTE: {location.pathname}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link
            to="/"
            className="font-bebas text-xl tracking-wider bg-primary text-primary-foreground px-10 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] hover:border hover:border-interactive transition-all inline-block"
          >
            RETURN HOME
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
