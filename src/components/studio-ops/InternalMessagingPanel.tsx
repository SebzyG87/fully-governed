import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, User, ShieldAlert, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StudioOpsCard, StudioOpsSection, StudioOpsBadge, StudioOpsEmpty } from "./StudioOpsPrimitives";

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isStaffOnly: boolean;
}

interface Conversation {
  id: string;
  title: string;
  type: "staff_internal" | "client_support";
  lastMessage: string;
  lastUpdated: string;
  messages: Message[];
}

export const InternalMessagingPanel = ({ staffRole, currentUserName = "Staff" }: { staffRole: string; currentUserName?: string }) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [newMessageText, setNewMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Default baseline conversations
  const baselineConversations: Conversation[] = [
    {
      id: "conv-1",
      title: "Staff General Operations",
      type: "staff_internal",
      lastMessage: "Clean room checklist completed for Studio B.",
      lastUpdated: "17:02",
      messages: [
        { id: "m1", sender: "Manny", senderRole: "studio_manager", content: "Hey team, we have a boiler room layout booking tonight in Studio A.", timestamp: "15:30", isStaffOnly: true },
        { id: "m2", sender: "Cleaner Crew", senderRole: "cleaner", content: "Vocal booth reset is done. Replaced the mic covers.", timestamp: "16:15", isStaffOnly: true },
        { id: "m3", sender: "Mono Luke", senderRole: "session_producer", content: "Sweet. I'll need some 3D model prototype preparation prints ready by 6pm.", timestamp: "16:45", isStaffOnly: true },
        { id: "m4", sender: "Manny", senderRole: "studio_manager", content: "Clean room checklist completed for Studio B.", timestamp: "17:02", isStaffOnly: true }
      ]
    },
    {
      id: "conv-2",
      title: "Client Support Request #FG-4029",
      type: "client_support",
      lastMessage: "Is it possible to reschedule to Friday at 2pm?",
      lastUpdated: "16:50",
      messages: [
        { id: "m5", sender: "Marcus Sterling", senderRole: "client_artist", content: "Hi, I have a booking today at 6pm but my artist is running late. Is it possible to reschedule to Friday at 2pm?", timestamp: "16:40", isStaffOnly: false },
        { id: "m6", sender: "System", senderRole: "automation", content: "Auto-reply: Rescheduling request registered. Staff review required.", timestamp: "16:41", isStaffOnly: false },
        { id: "m7", sender: "Marcus Sterling", senderRole: "client_artist", content: "Also, we paid the deposit, let me know if we need to pay the balance now.", timestamp: "16:50", isStaffOnly: false }
      ]
    },
    {
      id: "conv-3",
      title: "Seb Green <-> Admin (Ops Systems)",
      type: "staff_internal",
      lastMessage: "Custom booking buffer script is live on Supabase.",
      lastUpdated: "14:12",
      messages: [
        { id: "m8", sender: "Seb Green", senderRole: "systems_director", content: "I've added the room setup buffer calculations to the booking flow.", timestamp: "13:45", isStaffOnly: true },
        { id: "m9", sender: "Manny", senderRole: "studio_manager", content: "Awesome. Does it block the room automatically?", timestamp: "14:00", isStaffOnly: true },
        { id: "m10", sender: "Seb Green", senderRole: "systems_director", content: "Yes, 30m before and after. Custom booking buffer script is live on Supabase.", timestamp: "14:12", isStaffOnly: true }
      ]
    }
  ];

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fg_staff_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) setActiveConvId(parsed[0].id);
      } catch {
        setConversations(baselineConversations);
        if (baselineConversations.length > 0) setActiveConvId(baselineConversations[0].id);
      }
    } else {
      setConversations(baselineConversations);
      if (baselineConversations.length > 0) setActiveConvId(baselineConversations[0].id);
      localStorage.setItem("fg_staff_conversations", JSON.stringify(baselineConversations));
    }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    localStorage.setItem("fg_staff_conversations", JSON.stringify(updated));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConvId) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isStaff = staffRole !== "client_artist";

    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: currentUserName,
      senderRole: staffRole,
      content: newMessageText.trim(),
      timestamp: timeString,
      isStaffOnly: isStaff && conversations.find(c => c.id === activeConvId)?.type === "staff_internal"
    };

    const updated = conversations.map((conv) => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          lastMessage: newMessage.content,
          lastUpdated: timeString,
          messages: [...conv.messages, newMessage]
        };
      }
      return conv;
    });

    saveConversations(updated);
    setNewMessageText("");
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <StudioOpsSection title="Studio Inbox & Messaging" eyebrow="Communication" icon={MessageSquare}>
      <div className="grid gap-4 md:grid-cols-3 h-[30rem] border border-border rounded-2xl overflow-hidden bg-card/15">
        {/* Conversations List Sidebar */}
        <div className="md:col-span-1 border-r border-border/40 flex flex-col h-full bg-card/25">
          <div className="p-3 border-b border-border/40 flex justify-between items-center bg-card/30">
            <span className="font-bebas text-lg tracking-wide text-foreground">Inbox Threads</span>
            <Button size="sm" onClick={() => {
              const newTitle = prompt("Enter thread name:");
              if (!newTitle) return;
              const isSupport = confirm("Is this a Client Support channel? (Cancel for Staff Internal)");
              const newConv: Conversation = {
                id: Math.random().toString(36).substring(2, 9),
                title: newTitle,
                type: isSupport ? "client_support" : "staff_internal",
                lastMessage: "Thread created.",
                lastUpdated: "Just now",
                messages: [{
                  id: "start",
                  sender: "System",
                  senderRole: "system",
                  content: `Thread initialized by ${currentUserName}`,
                  timestamp: "Now",
                  isStaffOnly: !isSupport
                }]
              };
              const updated = [...conversations, newConv];
              saveConversations(updated);
              setActiveConvId(newConv.id);
            }} className="font-bebas text-[10px] bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 h-7 px-2">

              <Plus className="w-3 h-3 mr-1" /> New Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 focus:outline-none ${isActive ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/10"}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-semibold text-foreground text-xs leading-normal truncate max-w-[70%]">
                      {conv.title}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">{conv.lastUpdated}</span>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <StudioOpsBadge tone={conv.type === "staff_internal" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-sky-500/30 bg-sky-500/10 text-sky-300"}>
                      {conv.type === "staff_internal" ? "Staff Internal" : "Client Support"}
                    </StudioOpsBadge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Thread Panel */}
        <div className="md:col-span-2 flex flex-col h-full bg-background/20 justify-between">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border/40 bg-card/30 flex justify-between items-center">
                <div>
                  <h4 className="font-bebas text-lg tracking-wide text-foreground">{activeConv.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Mode: {activeConv.type === "staff_internal" ? "STAFF ONLY - INTERNAL DISCUSSION" : "CLIENT SUPPORT CHANNEL"}
                  </p>
                </div>
                <StudioOpsBadge tone={activeConv.type === "staff_internal" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-sky-500/30 bg-sky-500/10 text-sky-300"}>
                  {activeConv.type === "staff_internal" ? "Staff Channel" : "Client Facing"}
                </StudioOpsBadge>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-barlow text-xs">
                {activeConv.messages.map((msg) => {
                  const isSystem = msg.senderRole === "system" || msg.senderRole === "automation";
                  const isMe = msg.sender === currentUserName;
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center text-[10px] text-muted-foreground italic py-1">
                        {msg.content} ({msg.timestamp})
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <span className="text-[9px] font-mono text-muted-foreground mb-1">
                        {msg.sender} ({msg.senderRole.replace("_", " ")})
                      </span>
                      
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 leading-relaxed break-words border ${isMe ? "bg-primary text-black border-transparent rounded-tr-none" : "bg-card border-border rounded-tl-none text-foreground"}`}
                      >
                        <p>{msg.content}</p>
                        {msg.isStaffOnly && (
                          <span className="block text-[8px] opacity-65 font-mono mt-1 text-right italic uppercase">
                            [Staff Internal]
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[8px] font-mono text-muted-foreground mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border/40 bg-card/20 flex gap-2">
                <Input
                  placeholder={activeConv.type === "staff_internal" ? "Type internal staff memo..." : "Reply to client support ticket..."}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="bg-background border-border h-9 text-xs"
                />
                <Button type="submit" size="sm" className="font-bebas tracking-wider bg-primary text-primary-foreground h-9 px-4 shrink-0">
                  <Send className="w-3.5 h-3.5 mr-1" /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mr-2 opacity-50" /> Select a thread from the sidebar
            </div>
          )}
        </div>
      </div>
    </StudioOpsSection>
  );
};
