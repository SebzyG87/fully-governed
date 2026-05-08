import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type Room = Tables<"rooms">;

const roomColorClass: Record<string, string> = {
  "#D4AF37": "text-room-studio border-room-studio",
  "#C0392B": "text-room-multi border-room-multi",
  "#7B2FBE": "text-room-content border-room-content",
};

const Pricing = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    supabase.from("rooms").select("*").then(({ data }) => {
      if (data) setRooms(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-5xl md:text-7xl text-foreground">PRICING</h1>
          <p className="text-muted-foreground font-barlow mt-2">Transparent rates for every room</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room, i) => {
            const cc = roomColorClass[room.color] || "text-primary border-primary";
            const pricing = (room.pricing as Record<string, string>) || {};
            return (
              <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-card border-2 ${cc.split(" ")[1]} rounded-lg p-6`}>
                <h2 className={`text-3xl ${cc.split(" ")[0]}`}>{room.name.toUpperCase()}</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{room.description}</p>
                <div className="space-y-2">
                  {Object.entries(pricing).map(([label, price]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-foreground font-barlow text-sm">{label}</span>
                      <span className="font-mono text-foreground">{price}</span>
                    </div>
                  ))}
                </div>
                <Link to="/book" className="block mt-6">
                  <button className="w-full font-bebas text-lg tracking-wider bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:shadow-[0_0_12px_hsl(var(--interactive))] hover:border hover:border-interactive transition-all">
                    BOOK NOW
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
