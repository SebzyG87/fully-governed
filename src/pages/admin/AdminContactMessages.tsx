import { useEffect, useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean | null;
  created_at: string;
}

const filterOptions = ["all", "unread", "read"];

const AdminContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages((data as ContactMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Marked as read" }); fetchMessages(); }
  };

  const filtered = messages.filter(m => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bebas text-3xl text-foreground tracking-wider">CONTACT MESSAGES</h1>
        <p className="text-sm text-muted-foreground font-barlow">{messages.length} messages · {messages.filter(m => !m.read).length} unread</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${filter === f ? "bg-interactive text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? `All (${messages.length})` : f === "unread" ? `Unread (${messages.filter(m => !m.read).length})` : `Read (${messages.filter(m => m.read).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No messages found.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-xs">
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Email</th>
                <th className="text-left py-3 px-2">Subject</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <>
                  <tr key={m.id} className={`border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer ${!m.read ? "bg-accent/10" : ""}`} onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                    <td className="py-3 px-2 font-mono text-muted-foreground">{format(new Date(m.created_at!), "d MMM yy")}</td>
                    <td className={`py-3 px-2 ${!m.read ? "text-foreground font-semibold" : "text-foreground"}`}>{m.name}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{m.email}</td>
                    <td className={`py-3 px-2 ${!m.read ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{m.subject}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-mono ${m.read ? "text-muted-foreground" : "text-amber-400"}`}>{m.read ? "read" : "unread"}</span>
                    </td>
                    <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                      {!m.read && <Button size="sm" variant="outline" onClick={() => markAsRead(m.id)}>Mark Read</Button>}
                      {expandedId === m.id ? <ChevronUp className="w-4 h-4 text-muted-foreground inline ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground inline ml-2" />}
                    </td>
                  </tr>
                  {expandedId === m.id && (
                    <tr key={`${m.id}-msg`} className="border-b border-border/50">
                      <td colSpan={6} className="px-4 py-4 text-sm text-foreground bg-accent/20 whitespace-pre-wrap">{m.message}</td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;
