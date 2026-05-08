import { motion } from "framer-motion";
import { Radio } from "lucide-react";

const AdminRadio = () => (
  <div className="p-6 lg:p-8 space-y-6">
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-4xl text-foreground">RADIO</h1>
      <p className="text-muted-foreground font-barlow text-sm">Manage Fully Governed Radio</p>
    </motion.div>
    <div className="bg-card border border-border rounded-lg p-12 text-center">
      <Radio className="w-12 h-12 text-interactive mx-auto mb-4" />
      <p className="text-muted-foreground font-barlow text-lg">Radio management console coming soon</p>
      <p className="text-xs text-muted-foreground font-mono mt-2">Schedule shows, manage broadcasts, upload recordings</p>
    </div>
  </div>
);

export default AdminRadio;
