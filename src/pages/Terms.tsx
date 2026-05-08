import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16 space-y-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider text-center mb-2">TERMS OF SERVICE</h1>
        <p className="text-center text-sm text-muted-foreground font-barlow mb-10">Last updated: March 2026</p>
        <div className="prose prose-invert prose-sm max-w-none font-barlow space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">1. Account Registration</h2>
            <p>Users must provide accurate information. One account per person. You are responsible for keeping your login credentials secure. Fully Governed reserves the right to suspend accounts that breach these terms.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">2. Booking & Cancellation Policy</h2>
            <p>Bookings are confirmed on payment. Cancellations made more than 24 hours before the session start time are eligible for a full refund. Cancellations within 24 hours of the session are non-refundable. Amendments are subject to tier rules — Customer tier members may make a maximum of 2 amendments per booking. Creator Admin members have unlimited amendments.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">3. Payment Terms</h2>
            <p>All prices are in GBP. Payments are processed securely by Stripe. Sessions are non-refundable once they have started. Disputed charges must be raised within 7 days of the session date.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">4. Content Ownership</h2>
            <p>Artists retain full ownership of all music and content created at Fully Governed. By uploading content to the platform you grant Fully Governed a non-exclusive, royalty-free licence to display and distribute your content within the platform only.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">5. Platform Rules</h2>
            <p>No abusive or threatening behaviour toward staff or other members. No illegal content to be uploaded or distributed through the platform. Violations may result in immediate account suspension without refund.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">6. Limitation of Liability</h2>
            <p>Fully Governed is not liable for loss, theft, or damage to personal equipment brought onto the premises. Members are responsible for their own property at all times.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">7. Contact</h2>
            <p>For any queries relating to these terms, contact us at: <a href="mailto:musicfullygoverned@gmail.com" className="text-primary hover:underline">musicfullygoverned@gmail.com</a></p>
          </section>
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default Terms;
