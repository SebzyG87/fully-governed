import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider text-center mb-2">PRIVACY POLICY</h1>
        <p className="text-center text-sm text-muted-foreground font-barlow mb-10">Last updated: March 2026 — GDPR Compliant</p>
        <div className="prose prose-invert prose-sm max-w-none font-barlow space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">1. What We Collect</h2>
            <p>We collect: your name, email address, phone number, booking history, payment transaction data (processed by Stripe — we never store card numbers), platform usage data, and cookies.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">2. How We Use Your Data</h2>
            <p>To process bookings and payments. To send booking confirmations, amendments, and platform updates. To improve the platform experience. We do not use your data for advertising to third parties.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">3. Third Parties</h2>
            <p>Stripe — payment processing. Supabase — database and authentication. Resend — email delivery. We do not sell your personal data to any third party.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">4. Your Rights (GDPR)</h2>
            <p>You have the right to access, correct, or request deletion of your personal data at any time. To make a request, email us at <a href="mailto:contracts@fullygovernedstudios.co.uk" className="text-primary hover:underline">contracts@fullygovernedstudios.co.uk</a>. We will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">5. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We use analytics cookies to understand how the platform is used and improve it. You can disable cookies in your browser settings at any time.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">6. Contact</h2>
            <p>Data queries: <a href="mailto:contracts@fullygovernedstudios.co.uk" className="text-primary hover:underline">contracts@fullygovernedstudios.co.uk</a></p>
          </section>
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
