import { useState, useEffect } from "react";
import { ListTodo, CheckCircle2, Circle, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StudioOpsCard, StudioOpsSection, StudioOpsBadge, StudioOpsEmpty } from "./StudioOpsPrimitives";
import { MOCK_TASKS, type StudioTask } from "@/lib/mockStudioOps";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TASK_TONES: Record<string, string> = {
  to_do: "border-border bg-muted/20 text-muted-foreground",
  in_progress: "border-primary/25 bg-primary/10 text-primary",
  blocked: "border-red-500/25 bg-red-500/10 text-red-300",
  complete: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const PRIORITY_TONES: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-sky-300",
  high: "text-amber-300",
  urgent: "text-red-300",
};

export const InteractiveTaskPanel = ({ staffRole }: { staffRole: string }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudioTask[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "outstanding" | "completed">("outstanding");
  const [isLiveData, setIsLiveData] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newDue, setNewDue] = useState("");
  const [newSession, setNewSession] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const rowToTask = (row: any): StudioTask => ({
    id: row.id,
    title: row.title,
    assignedTo: row.assigned_to_name || "Unassigned",
    assignedRole: row.assigned_role || staffRole,
    linkedSession: row.linked_label || "No Session",
    dueTime: row.due_label || (row.due_at ? new Date(row.due_at).toLocaleString() : "End of shift"),
    priority: row.priority,
    status: row.status,
    notes: row.notes || "None",
  });

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("fg_staff_tasks" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setTasks((data as any[]).map(rowToTask));
      setIsLiveData(true);
      return;
    }

    const saved = localStorage.getItem("fg_staff_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
        return;
      } catch {
        setTasks(MOCK_TASKS);
      }
    } else {
      setTasks(MOCK_TASKS);
      localStorage.setItem("fg_staff_tasks", JSON.stringify(MOCK_TASKS));
    }
  };

  useEffect(() => {
    loadTasks();
  }, [staffRole]);

  const saveTasks = async (updated: StudioTask[]) => {
    setTasks(updated);
    if (!isLiveData) {
      localStorage.setItem("fg_staff_tasks", JSON.stringify(updated));
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const currentTask = tasks.find((task) => task.id === taskId);
    const nextStatus = currentTask?.status === "complete" ? "to_do" : "complete";
    if (isLiveData) {
      const { error } = await supabase
        .from("fg_staff_tasks" as any)
        .update({
          status: nextStatus,
          completed_at: nextStatus === "complete" ? new Date().toISOString() : null,
          completed_by: nextStatus === "complete" ? user?.id ?? null : null,
        })
        .eq("id", taskId);
      if (error) {
        toast({ title: "Task update failed", description: error.message, variant: "destructive" });
        return;
      }
    }
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, status: nextStatus as StudioTask["status"] };
      }
      return t;
    });
    saveTasks(updated);
    toast({ title: "Task status updated" });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: StudioTask = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      assignedTo: newAssignee.trim() || "Unassigned",
      assignedRole: staffRole,
      linkedSession: newSession.trim() || "No Session",
      dueTime: newDue.trim() || "End of shift",
      priority: newPriority,
      status: "to_do",
      notes: newNotes.trim() || "None",
    };

    if (isLiveData) {
      const { data, error } = await supabase
        .from("fg_staff_tasks" as any)
        .insert({
          title: newTask.title,
          assigned_to_name: newTask.assignedTo,
          assigned_role: staffRole,
          linked_label: newTask.linkedSession,
          priority: newTask.priority,
          status: newTask.status,
          due_label: newTask.dueTime,
          notes: newTask.notes,
          task_category: staffRole === "cleaner" ? "cleaner" : staffRole === "producer" ? "producer" : "staff",
          created_by: user?.id ?? null,
        })
        .select("*")
        .single();
      if (error) {
        toast({ title: "Task could not be saved", description: error.message, variant: "destructive" });
        return;
      }
      newTask.id = data.id;
    }

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    
    // Reset form
    setNewTitle("");
    setNewAssignee("");
    setNewPriority("medium");
    setNewDue("");
    setNewSession("");
    setNewNotes("");
    setShowAddForm(false);
    toast({ title: "Task added successfully" });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isLiveData) {
      const { error } = await supabase.from("fg_staff_tasks" as any).delete().eq("id", taskId);
      if (error) {
        toast({ title: "Task delete failed", description: error.message, variant: "destructive" });
        return;
      }
    }
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    toast({ title: "Task deleted" });
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "completed") return t.status === "complete";
    if (activeTab === "outstanding") return t.status !== "complete";
    return true;
  });

  return (
    <StudioOpsSection
      title="Tasks & Checklists"
      eyebrow="Workflow"
      icon={ListTodo}
      action={
        <div className="flex gap-2 items-center">
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="font-bebas text-xs tracking-wider bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 h-7 px-2">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
          </Button>
          <span className="rounded bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[9px] font-mono font-bold">
            {isLiveData ? "Live" : "Local fallback"}
          </span>
        </div>
      }
    >

      {/* Create Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3 mb-4 text-sm font-barlow">
          <h4 className="font-bebas text-lg tracking-wide text-foreground">Create New Task</h4>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="e.g. Clean room, Reset podcast setup"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="h-8 text-xs bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-assignee">Assignee Name</Label>
              <Input
                id="task-assignee"
                placeholder="e.g. Manny, Mono Luke"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="h-8 text-xs bg-background border-border"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full h-8 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-due">Due Date / Time</Label>
              <Input
                id="task-due"
                placeholder="e.g. 18:00, Tomorrow"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="h-8 text-xs bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-session">Linked Booking / Room</Label>
              <Input
                id="task-session"
                placeholder="e.g. Studio 1B, Podcast Session"
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
                className="h-8 text-xs bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="task-notes">Notes / Instructions</Label>
            <Input
              id="task-notes"
              placeholder="Provide context or checklists..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="h-8 text-xs bg-background border-border"
            />
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bebas tracking-wider bg-primary text-primary-foreground text-xs">
              Save Task
            </Button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border/40 gap-4 mb-4">
        {[
          { key: "outstanding", label: "Outstanding" },
          { key: "completed", label: "Completed" },
          { key: "all", label: "All" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-2 text-xs font-mono tracking-wider transition-colors border-b-2 -mb-[2px] ${activeTab === tab.key ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task cards list */}
      <div className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <StudioOpsEmpty>No tasks found in this category.</StudioOpsEmpty>
        ) : (
          filteredTasks.map((task) => (
            <StudioOpsCard
              key={task.id}
              className={`transition-colors border border-border ${task.status === "complete" ? "opacity-60 bg-muted/5" : "bg-card/45"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(task.id)}
                  className="mt-1 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  {task.status === "complete" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className={`font-bebas text-lg tracking-wide text-foreground ${task.status === "complete" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${PRIORITY_TONES[task.priority] ?? ""}`}>
                        {task.priority} Priority
                      </span>
                      <StudioOpsBadge tone={TASK_TONES[task.status] ?? "border-border"}>
                        {task.status.replace("_", " ")}
                      </StudioOpsBadge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {task.linkedSession} · due {task.dueTime}
                  </p>
                  
                  <div className="mt-2 text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    <span>Assignee: <strong className="text-foreground">{task.assignedTo}</strong></span>
                    <span>Role: <strong className="text-foreground">{task.assignedRole}</strong></span>
                  </div>

                  {task.notes && (
                    <p className="mt-2 rounded-lg bg-background/50 border border-border/30 p-2 text-[11px] text-muted-foreground font-barlow">
                      {task.notes}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </StudioOpsCard>
          ))
        )}
      </div>
    </StudioOpsSection>
  );
};
