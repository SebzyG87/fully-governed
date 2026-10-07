import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BookingFAB = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/book" || pathname.startsWith("/auth")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 md:hidden"
        >
          <Link
            to="/book"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-bebas text-lg tracking-wider px-5 py-3 rounded-full shadow-lg hover:shadow-[0_0_16px_hsl(var(--interactive))] transition-all"
          >
            <Calendar className="w-5 h-5" />
            BOOK
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingFAB;
