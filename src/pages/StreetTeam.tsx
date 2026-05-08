import { motion } from "framer-motion";
import { Users, ClipboardList, Gift, UserPlus, Star, Zap, Ticket, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Star, title: "Earn Rewards", desc: "Complete tasks and rack up points for real rewards." },
  { icon: DollarSign, title: "Cash Payouts", desc: "Hit milestones and get paid — admin-approved PayPal payouts." },
  { icon: Zap, title: "Studio Discounts", desc: "Get percentage discounts on recording sessions." },
  { icon: Ticket, title: "Exclusive Access", desc: "Free entry to studio events, launch parties and more." },
  { icon: Users, title: "Be Part of the Movement", desc: "Join a community of creators repping Fully Governed across the UK." },
];

const StreetTeam = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-16">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Join the Movement</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">STREET TEAM</h1>
        <p className="text-muted-foreground font-barlow mt-4 text-lg leading-relaxed">
          The Fully Governed Street Team is our on-the-ground promotional force. Flyer, post, film and promote — earn points, unlock rewards and get paid. Whether you're repping at events, pushing content online or hitting the streets, there's a role for you.
        </p>
      </motion.div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {benefits.map((b, i) => (
          <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card border border-border rounded-lg p-6">
            <b.icon className="w-7 h-7 text-primary mb-3" />
            <h3 className="font-bebas text-lg text-foreground tracking-wider mb-1">{b.title}</h3>
            <p className="text-sm text-muted-foreground font-barlow">{b.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/street-team/join">
          <Button className="font-bebas text-lg tracking-wider px-10 h-14 text-lg">JOIN THE STREET TEAM</Button>
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { title: "TASKS", desc: "View available missions and earn points.", href: "/street-team/tasks", icon: ClipboardList },
          { title: "REWARDS", desc: "Browse the rewards catalogue and redeem points.", href: "/street-team/rewards", icon: Gift },
          { title: "APPLY", desc: "Submit your application to join the team.", href: "/street-team/join", icon: UserPlus },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Link to={s.href} className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors group h-full">
              <s.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bebas text-lg text-foreground tracking-wider mb-1 group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-sm text-muted-foreground font-barlow">{s.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default StreetTeam;
