import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Link2, MessageSquare, Save, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { AuditEvent, LinkedPerson, OperationalComment, StudioTask } from "@/lib/mockStudioOps";
import { StudioOpsBadge, StudioOpsCard, StudioOpsEmpty } from "./StudioOpsPrimitives";

export interface OperationalDrawerData {
  id: string;
  kind: "session" | "room" | "cleaning" | "booking" | "payment" | "reminder" | "task" | "profile" | "alert" | "package";
  title: string;
  subtitle: string;
  status: string;
  tags?: string[];
  fields?: Array<{ label: string; value: string }>;
  linkedPeople?: LinkedPerson[];
  notes?: string[];
  tasks?: StudioTask[];
  comments?: OperationalComment[];
  history?: AuditEvent[];
  relationships?: Array<{ label: string; value: string; href?: string }>;
}

const statusOptions = ["confirmed", "checked_in", "in_progress", "needs_cleaning", "ready", "completed", "blocked", "cancelled"];

export const OperationalDetailDrawer = ({
  item,
  open,
  onOpenChange,
  canEdit = true,
  onSaveUpdate,
}: {
  item: OperationalDrawerData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit?: boolean;
  onSaveUpdate?: (update: { item: OperationalDrawerData; status: string; assignee: string; comment: string }) => Promise<string | void> | string | void;
}) => {
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(item?.status ?? "confirmed");
  const [assignee, setAssignee] = useState("");
  const [localEvents, setLocalEvents] = useState<AuditEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const history = useMemo(() => [...localEvents, ...(item?.history ?? [])], [item?.history, localEvents]);

  useEffect(() => {
    setStatus(item?.status ?? "confirmed");
    setAssignee("");
    setComment("");
    setLocalEvents([]);
    setSaveError("");
  }, [item?.id, item?.status]);

  if (!item) return null;

  const saveUpdate = async () => {
    setSaving(true);
    setSaveError("");
    const error = await onSaveUpdate?.({ item, status, assignee, comment });
    if (error) {
      setSaveError(error);
      setSaving(false);
      return;
    }
    const timestamp = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setLocalEvents((events) => [
      {
        id: `local-${Date.now()}`,
        actor: "Current admin",
        action: "Operational update saved",
        timestamp,
        detail: `${item.title} updated to ${status}${assignee ? ` and assigned to ${assignee}` : ""}${comment ? ` · ${comment}` : ""}`,
      },
      ...events,
    ]);
    setComment("");
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border bg-background sm:max-w-2xl">
        <SheetHeader className="pr-8">
          <SheetDescription className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            {item.kind} · {item.id}
          </SheetDescription>
          <SheetTitle className="font-bebas text-4xl tracking-wider">{item.title}</SheetTitle>
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <StudioOpsBadge tone="border-primary/25 bg-primary/10 text-primary">{status}</StudioOpsBadge>
            {(item.tags ?? []).map((tag) => (
              <StudioOpsBadge key={tag}>{tag}</StudioOpsBadge>
            ))}
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid h-auto w-full grid-cols-4 bg-card/70">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(item.fields ?? []).map((field) => (
                <StudioOpsCard key={field.label}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{field.label}</p>
                  <p className="mt-1 text-sm text-foreground">{field.value}</p>
                </StudioOpsCard>
              ))}
            </div>

            <StudioOpsCard className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Link2 className="h-4 w-4" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]">Linked people and records</p>
              </div>
              <div className="grid gap-2">
                {(item.linkedPeople ?? []).map((person) => (
                  <Link
                    key={person.id}
                    to={`/admin/people/${person.id}`}
                    className="rounded-xl border border-border bg-card/70 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {person.name} · {person.role}
                  </Link>
                ))}
                {(item.relationships ?? []).map((relationship) =>
                  relationship.href ? (
                    <Link key={relationship.label} to={relationship.href} className="rounded-xl border border-border bg-card/70 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                      {relationship.label}: {relationship.value}
                    </Link>
                  ) : (
                    <div key={relationship.label} className="rounded-xl border border-border bg-card/70 p-3 text-sm text-muted-foreground">
                      {relationship.label}: <span className="text-foreground">{relationship.value}</span>
                    </div>
                  )
                )}
              </div>
            </StudioOpsCard>

            <StudioOpsCard className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-4 w-4" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]">Notes and comments</p>
              </div>
              {(item.notes ?? []).map((note) => (
                <p key={note} className="rounded-xl bg-card/70 p-3 text-sm text-muted-foreground">{note}</p>
              ))}
              {(item.comments ?? []).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-border bg-card/70 p-3 text-sm">
                  <p className="text-foreground">{entry.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{entry.author} · {entry.timestamp}</p>
                </div>
              ))}
            </StudioOpsCard>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-3">
            {(item.tasks ?? []).length === 0 ? (
              <StudioOpsEmpty>No checklist items are linked yet.</StudioOpsEmpty>
            ) : (
              item.tasks?.map((task) => (
                <label key={task.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" defaultChecked={task.status === "complete"} />
                  <span>
                    <span className="block text-foreground">{task.title}</span>
                    <span className="text-xs">{task.assignedTo} · {task.priority} · {task.dueTime}</span>
                  </span>
                </label>
              ))
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {!canEdit && <StudioOpsEmpty>This role can inspect the record but cannot edit operational fields.</StudioOpsEmpty>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select disabled={!canEdit} value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-card/70"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => <SelectItem key={option} value={option}>{option.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign staff</Label>
                <Input disabled={!canEdit} value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Producer, cleaner, engineer..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Tags className="h-4 w-4" /> Tags</Label>
              <Input disabled={!canEdit} defaultValue={(item.tags ?? []).join(", ")} />
            </div>
            <div className="space-y-2">
              <Label>Admin comment</Label>
              <Textarea disabled={!canEdit} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave a traceable operational note..." />
            </div>
            <Button disabled={!canEdit} onClick={saveUpdate} className="w-full font-bebas tracking-wider">
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Operational Update"}
            </Button>
            {saveError && <p className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-200">{saveError}</p>}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {history.length === 0 ? (
              <StudioOpsEmpty>No audit events yet.</StudioOpsEmpty>
            ) : (
              history.map((event) => (
                <div key={event.id} className="rounded-2xl border border-border bg-card/70 p-4">
                  <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-foreground">{event.action}</p>
                      <p className="text-xs text-muted-foreground">{event.actor} · {event.timestamp}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
