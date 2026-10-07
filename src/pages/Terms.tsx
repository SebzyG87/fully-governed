import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <main className="container mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-24">
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-center font-bebas text-5xl tracking-wider text-foreground md:text-7xl">BOOKING INFORMATION</h1>
        <p className="mb-8 text-center font-barlow text-sm text-muted-foreground">Operational summary · reviewed 8 October 2026</p>
      </motion.header>
      <section className="space-y-4 font-barlow text-muted-foreground">
        <h2 className="font-bebas text-2xl tracking-wider text-foreground">Studio bookings</h2>
        <p>Bookings have a 2-hour minimum; a 4-hour block is preferred. Allow 30 minutes for setup or changeover. Confirm your room, equipment, access and any support with the studio before attending.</p>
      </section>
      <section className="space-y-4 font-barlow text-muted-foreground">
        <h2 className="font-bebas text-2xl tracking-wider text-foreground">Cancellation schedule</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>48 hours or more before the session: full credit.</li>
          <li>24 to 48 hours before the session: 50% charge.</li>
          <li>Less than 24 hours before the session: 100% charge.</li>
        </ul>
        <p>Contact the studio to arrange a cancellation or discuss credit handling. The terms in your signed booking agreement apply to your booking.</p>
      </section>
      <section className="space-y-4 border-t border-border pt-6 font-barlow text-muted-foreground">
        <h2 className="font-bebas text-2xl tracking-wider text-foreground">Full terms</h2>
        <p>The supplied contracts and forms are working templates and require solicitor review. This page is an operational summary, not a complete legal agreement. Full legal terms will be published after review. For questions, contact <a href="mailto:contracts@fullygovernedstudios.co.uk" className="text-primary hover:underline">contracts@fullygovernedstudios.co.uk</a>.</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default Terms;
