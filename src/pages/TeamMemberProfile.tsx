import { useParams, Link, useNavigate } from "react-router-dom";
import { TEAM_MEMBERS } from "@/data/team";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, MessageSquare, ArrowRight, Music, Video, Palette, Box, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categoryIconMap: Record<string, any> = {
  "music & audio": Music,
  "video & motion": Video,
  "design": Palette,
  "3d / product": Box,
  "video & content": Video,
  "web & digital": Box,
  "business & operations": FileText,
  "creative direction": CrownIcon,
};


function CrownIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

export default function TeamMemberProfile() {
  const { memberSlug } = useParams();
  const navigate = useNavigate();
  const member = TEAM_MEMBERS.find((m) => m.slug === memberSlug);

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="grain-overlay" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-destructive font-bebas text-2xl tracking-wider">MEMBER NOT FOUND</p>
          <p className="text-muted-foreground text-sm max-w-xs">The profile you are trying to view does not exist on our team database.</p>
          <Button asChild variant="outline">
            <Link to="/team">Back to Meet the Team</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />

      <main className="container pt-28 pb-16 space-y-10 max-w-5xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> BACK TO TEAM
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {/* Avatar and Quick Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 space-y-6"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-border bg-card/20 shadow-xl">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
            </div>

            {/* Quick Stats Grid */}
            <div className="rounded-2xl border border-border bg-card/20 p-5 space-y-4 font-barlow text-sm">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">RATES</p>
                <p className="font-semibold text-foreground mt-0.5">{member.ratePlaceholder}</p>
              </div>
              <div className="border-t border-border/40 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">AVAILABILITY</p>
                <p className="font-semibold text-foreground mt-0.5">{member.availabilityPlaceholder}</p>
              </div>
              <div className="border-t border-border/40 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">HOURS/NOTE</p>
                <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{member.availabilityNotes}</p>
              </div>
            </div>

            {/* Direct Booking CTA */}
            <Button asChild className="w-full font-bebas text-lg tracking-wider h-12 bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Link to={`/book?producer=${member.slug}`} className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" /> BOOK WITH {member.name.toUpperCase()}
              </Link>
            </Button>
          </motion.div>

          {/* Detailed Biography, Skills, Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-8"
          >
            {/* Name / Title */}
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{member.role}</span>
              <h1 className="font-bebas text-5xl md:text-6xl tracking-wider text-foreground mt-1">{member.name}</h1>
              <p className="font-mono text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/40 pl-3">{member.tone}</p>
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <h2 className="font-bebas text-2xl tracking-wider text-foreground">ABOUT</h2>
              <p className="text-sm md:text-base text-muted-foreground font-barlow leading-relaxed whitespace-pre-line">
                {member.bio}
              </p>
            </div>

            {/* Skills Tags */}
            <div className="space-y-3">
              <h2 className="font-bebas text-2xl tracking-wider text-foreground">SKILLS & COMPETENCIES</h2>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-mono text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Services Accordion / Lists */}
            <div className="space-y-4">
              <h2 className="font-bebas text-2xl tracking-wider text-foreground">SERVICES OFFERED</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {member.serviceCategories.map((category) => {
                  const Icon = categoryIconMap[category.title.toLowerCase()] || FileText;
                  return (
                    <div
                      key={category.title}
                      className="rounded-2xl border border-border bg-card/30 p-5 space-y-3 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                        <Icon className="w-4 h-4 text-primary" />
                        <h3 className="font-bebas text-lg tracking-wide text-foreground">{category.title.toUpperCase()}</h3>
                      </div>
                      <ul className="space-y-1.5">
                        {category.items.map((srv) => (
                          <li key={srv} className="flex items-start gap-2 text-xs font-barlow text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                            <span>{srv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portfolio / Media Placeholder */}
            <div className="space-y-4 border-t border-border/40 pt-8">
              <h2 className="font-bebas text-2xl tracking-wider text-foreground">PORTFOLIO & MEDIA</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {member.portfolio.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative h-32 rounded-2xl border border-border bg-card/20 p-4 flex flex-col justify-between overflow-hidden hover:border-primary/20 transition-all"
                  >
                    <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-primary/40 group-hover:text-primary/70 transition-colors">
                      DEMO DATA
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-card/60 flex items-center justify-center text-muted-foreground">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-barlow text-sm font-semibold text-foreground">{item}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Media attachment placeholder</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div>
                <h3 className="font-bebas text-2xl tracking-wide text-foreground">Need a custom campaign setup?</h3>
                <p className="text-xs text-muted-foreground font-barlow mt-1">Contact admin support for custom agency booking rates or multi-producer scheduling.</p>
              </div>
              <Button asChild variant="outline" className="font-barlow text-xs h-10 shrink-0 border-border hover:border-primary/30">
                <Link to="/contact" className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Contact Studio Manager
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
