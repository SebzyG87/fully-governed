import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { STAFF_TASK_TEMPLATES } from "@/lib/taskTemplates";

interface StaffTaskRow {
  id: string;
  title: string;
  assigned_to_name: string | null;
  assigned_role: string;
  linked_label: string | null;
  task_category: string;
  priority: string;
  status: string;
  due_at: string | null;
  due_label: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ["to_do", "in_progress", "blocked", "complete"];

export default function AdminTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<StaffTaskRow[]>([]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from("fg_staff_tasks" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setTasks((data as StaffTaskRow[]) || []);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("fg_staff_tasks" as any)
      .update({ status, completed_at: status === "complete" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) {
      toast({ title: "Task update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Task updated" });
    loadTasks();
  };

  const seedTemplates = async () => {
    const { error } = await supabase.from("fg_staff_tasks" as any).insert(
      STAFF_TASK_TEMPLATES.map((template) => ({
        title: template.title,
        assigned_role: template.assignedRole,
        task_category: template.taskCategory,
        priority: template.priority,
        status: "to_do",
        due_label: template.dueLabel,
        notes: template.notes,
        checklist: template.checklist.map((item) => ({ item, done: false })),
      }))
    );

    if (error) {
      toast({ title: "Template seed failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Task templates added" });
    loadTasks();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl text-foreground">TASK BOARD</h1>
          <p className="text-muted-foreground font-barlow text-sm">Staff, producer, cleaner, daily checklist, session prep and breakdown tasks.</p>
        </div>
        <Button onClick={seedTemplates} className="font-bebas tracking-wider">
          <Sparkles className="mr-2 h-4 w-4" />
          Add Standard Tasks
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {STAFF_TASK_TEMPLATES.slice(0, 6).map((template) => (
          <article key={template.id} className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{template.taskCategory.replace(/_/g, " ")}</p>
            <h2 className="mt-1 font-bebas text-xl tracking-wide text-foreground">{template.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{template.checklist.length} checklist items · {template.dueLabel}</p>
          </article>
        ))}
      </section>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No live tasks yet. Tasks created in staff dashboards will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-lg border border-border bg-card/55 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{task.task_category.replace(/_/g, " ")}</p>
                  <h2 className="font-bebas text-2xl tracking-wide text-foreground">{task.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {task.assigned_to_name || "Unassigned"} · {task.assigned_role} · {task.linked_label || "No linked session"} · {format(new Date(task.created_at), "d MMM HH:mm")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <Button key={status} size="sm" variant={task.status === status ? "default" : "outline"} onClick={() => updateStatus(task.id, status)} className="font-mono text-xs">
                      {status === "complete" && task.status === status ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
                      {status.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
                <p><span className="text-muted-foreground">Priority:</span> <span className="text-foreground">{task.priority}</span></p>
                <p><span className="text-muted-foreground">Due:</span> <span className="text-foreground">{task.due_label || (task.due_at ? format(new Date(task.due_at), "d MMM HH:mm") : "Not set")}</span></p>
                <p><span className="text-muted-foreground">Status:</span> <span className="text-foreground">{task.status.replace("_", " ")}</span></p>
              </div>
              {task.notes ? <p className="mt-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">{task.notes}</p> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
