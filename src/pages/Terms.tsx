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
            <p>Bookings are locked upon receipt of a deposit. The full balance must be paid at least 48 hours before the scheduled session start time. If the balance remains unpaid after this deadline, the studio slot will be released and made available for other bookings. If another client books the released slot, the original client loses the slot. Bookings made within 48 hours of the session require immediate full payment. No refunds are issued for client cancellations under any circumstances. In the event of a studio-initiated cancellation, a full refund will be provided.</p>
          </section>
          <section>
            <h2 className="font-bebas text-2xl text-foreground tracking-wider">3. Rescheduling & Liability Rules</h2>
            <p>Clients are allowed one reschedule request up to 24 hours prior to the session start time (subject to the slot being re-booked). A second reschedule request is not guaranteed and payment is lost if the slot is taken by another client. Reschedule requests made with less than 24 hours notice will not be accommodated, and all payments will be forfeited. Producers and creative service providers bringing their own clients are fully responsible for their team and staff, and are financially liable for any physical damage caused to the studio rooms, setups, or equipment by participants they introduce.</p>
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
