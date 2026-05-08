import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle, Clock, MapPin, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  title: string;
  task_type: string;
  location: string | null;
  points_reward: number;
  status: string;
  deadline: string | null;
}

const DEFAULT_TASKS = [
  { title: "Drop flyers at Lewisham Station", task_type: "Flyer Distribution", location: "Lewisham", points_reward: 50 },
  { title: "Post about FG on your Instagram story", task_type: "Social Media Post", location: null, points_reward: 30 },
  { title: "Help at next studio event", task_type: "Event Support", location: null, points_reward: 100 },
  { title: "Film content at the studio", task_type: "Photography & Video", location: null, points_reward: 75 },
  { title: "Promote in local Facebook groups", task_type: "Online Promotion", location: null, points_reward: 25 },
];

const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    "Flyer Distribution": "bg-orange-900/30 text-orange-400 border-orange-700/50",
    "Social Media Post": "bg-blue-900/30 text-blue-400 border-blue-700/50",
    "Event Support": "bg-primary/20 text-primary border-primary/30",
    "Photography & Video": "bg-purple-900/30 text-purple-400 border-purple-700/50",
    "Online Promotion": "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
  };
  return map[type] || "bg-secondary text-secondary-foreground border-border";
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTasks = async () => {
      let { data } = await supabase
        .from("street_team_tasks")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Seed defaults if empty
      if (!data || data.length === 0) {
        for (const t of DEFAULT_TASKS) {
          await supabase.from("street_team_tasks").insert({
            title: t.title,
            task_type: t.task_type,
            location: t.location,
            points_reward: t.points_reward,
          } as any);
        }
        const { data: seeded } = await supabase.from("street_team_tasks").select("*").eq("status", "active").order("created_at", { ascending: false });
        data = seeded;
      }

      setTasks((data as Task[]) || []);

      if (user) {
        const { data: completions } = await supabase
          .from("street_team_task_completions")
          .select("task_id, status")
          .eq("user_id", user.id);
        const accepted = new Set<string>();
        const completed = new Set<string>();
        (completions || []).forEach((c: any) => {
          if (c.status === "pending") accepted.add(c.task_id);
          if (c.status === "approved") completed.add(c.task_id);
        });
        setAcceptedIds(accepted);
        setCompletedIds(completed);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [user]);

  const handleAccept = async (taskId: string) => {
    if (!user) { toast.error("Sign in to accept tasks."); return; }
    const { error } = await supabase.from("street_team_task_completions").insert({
      task_id: taskId,
      user_id: user.id,
      status: "pending",
    } as any);
    if (error) toast.error(error.message);
    else {
      toast.success("Task accepted! Complete it and mark as done.");
      setAcceptedIds(new Set([...acceptedIds, taskId]));
    }
  };

  const handleMarkComplete = (taskId: string) => {
    toast.success("Task submitted for review! 🎯 Admin will verify within 48 hours.");
    setCompletedIds(new Set([...completedIds, taskId]));
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="grain-overlay" />
      <div className="container pt-24 pb-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Street Team</p>
          <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">TASKS</h1>
          <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">Complete tasks to earn points. Submit and we'll review within 48 hours.</p>
        </motion.div>

        {loading ? (
          <div className="max-w-3xl mx-auto space-y-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 py-16 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground font-barlow">No tasks available right now — check back soon.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {tasks.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bebas text-xl text-foreground tracking-wider">{t.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[10px] font-mono ${typeBadgeClass(t.task_type)}`}>
                        <Tag className="w-2.5 h-2.5 mr-1" />{t.task_type}
                      </Badge>
                      {t.location && (
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{t.location}
                        </span>
                      )}
                      {t.deadline && (
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(t.deadline).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-mono text-xs">
                        {t.points_reward} pts
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {completedIds.has(t.id) ? (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />Completed
                      </span>
                    ) : acceptedIds.has(t.id) ? (
                      <Button size="sm" variant="outline" onClick={() => handleMarkComplete(t.id)} className="font-bebas tracking-wider">
                        MARK COMPLETE
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleAccept(t.id)} className="font-bebas tracking-wider">
                        ACCEPT TASK
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tasks;
