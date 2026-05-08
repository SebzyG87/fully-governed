import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface VehicleReg {
  id: string;
  visitor_name: string;
  registration_number: string;
  visit_date: string;
  created_at: string;
}

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<VehicleReg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from("vehicle_registrations").select("*").order("visit_date", { ascending: false }).limit(200) as any)
      .then(({ data }: any) => {
        setVehicles(data || []);
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    const csv = [
      "Name,Registration,Visit Date,Registered At",
      ...vehicles.map((v) => `${v.visitor_name},${v.registration_number},${v.visit_date},${format(new Date(v.created_at), "yyyy-MM-dd HH:mm")}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `vehicles-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-foreground">VEHICLE LOG</h1>
          <p className="text-muted-foreground font-barlow text-sm">{vehicles.length} registrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="font-barlow">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><Car className="w-6 h-6 text-primary animate-pulse" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Visitor Name</th>
                <th className="text-left py-3 px-2">Registration</th>
                <th className="text-left py-3 px-2">Visit Date</th>
                <th className="text-left py-3 px-2">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{v.visitor_name}</td>
                  <td className="py-3 px-2 font-mono text-foreground uppercase">{v.registration_number}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{v.visit_date}</td>
                  <td className="py-3 px-2 font-mono text-muted-foreground">{format(new Date(v.created_at), "d MMM yy HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
