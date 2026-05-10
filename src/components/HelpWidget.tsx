import { useState, useRef, useEffect } from "react";
import { HelpCircle, X, Search, ArrowRight, Bot, MessageSquare, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { helpArticles } from "@/data/helpArticles";

const popularSlugs = [
  "how-to-book-a-session",
  "cancellation-policy",
  "what-rooms-are-available",
  "loyalty-points-explained",
  "parking-and-vehicle-registration",
];

const HelpWidget = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"articles" | "chat">("articles");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
    { role: "ai", content: "Hi! I'm Seb's AI Assistant. Ask me anything about this service and I'll do my best to help." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = search.length > 1
    ? helpArticles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : helpArticles.filter(a => popularSlugs.includes(a.slug)).slice(0, 5);

  const [loading, setLoading] = useState(false);
  const hidden = pathname.startsWith("/auth") || pathname.startsWith("/admin") || pathname.startsWith("/unlock");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setChatInput("");
    setLoading(true);

    try {
      const assistantEndpoint = import.meta.env.VITE_AI_ASSISTANT_ENDPOINT;
      if (!assistantEndpoint) {
        throw new Error("AI assistant endpoint is not configured");
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(assistantEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5', prompt: userMessage, stream: false }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        setMessages([...newMessages, { role: "ai", content: data.response || 'No response received' }]);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setMessages([...newMessages, { 
        role: "ai", 
        content: "I'm currently offline — my AI brain runs on Seb's Mac. Browse the help articles above or get in touch directly." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (hidden) return null;

  return (
    <>
      {/* Floating button — bottom-left to avoid BookingFAB on right */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 left-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-[0_0_16px_hsl(var(--interactive))] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:bottom-6"
        aria-label="Help"
      >
        {open ? <X className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[5.5rem] left-6 z-50 w-[350px] max-h-[65vh] h-[500px] bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col lg:bottom-20"
          >
            {/* Header / Tabs */}
            <div className="flex border-b border-border bg-muted/30">
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "articles" ? "text-foreground border-b-2 border-primary bg-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <Search className="w-4 h-4" /> Articles
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "chat" ? "text-foreground border-b-2 border-primary bg-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <Bot className="w-4 h-4" /> AI Assistant
              </button>
            </div>

            {activeTab === "articles" ? (
              <>
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search help articles..."
                      className="pl-9 bg-background h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Articles */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filtered.map((article) => (
                    <Link
                      key={article.slug}
                      to={`/help/${article.slug}`}
                      onClick={() => setOpen(false)}
                      className="block p-3 rounded-md hover:bg-accent/50 transition-colors group"
                    >
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{article.summary}</p>
                    </Link>
                  ))}
                  {filtered.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No articles found. Try the AI Assistant!
                    </div>
                  )}
                </div>

                {/* Footer links */}
                <div className="p-3 border-t border-border space-y-2 bg-muted/10">
                  <Link
                    to="/help"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Visit Full Help Centre <ArrowRight className="w-4 h-4 text-primary" />
                  </Link>
                  <a
                    href="mailto:info@fullygoverned.com"
                    className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us directly
                  </a>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full overflow-hidden bg-background/50">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm border border-border"}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-tl-sm border border-border p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-border bg-background">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI a question..."
                      className="pr-10 bg-muted/50 border-transparent focus-visible:ring-1"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || loading}
                      className="absolute right-2 p-1.5 text-primary disabled:text-muted-foreground hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[10px] text-center text-muted-foreground mt-2 font-mono">
                    AI can make mistakes. Check important info.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpWidget;
