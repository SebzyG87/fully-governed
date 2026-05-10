import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Home, Calendar, LayoutDashboard, Users, HelpCircle, ShoppingBag, Music, Mic, Radio, MapPin, FileText, Star } from "lucide-react";
import { helpArticles } from "@/data/helpArticles";

const pages = [
  { label: "Home", path: "/", icon: Home },
  { label: "Book a Session", path: "/book", icon: Calendar },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Community", path: "/community", icon: Users },
  { label: "Help Centre", path: "/help", icon: HelpCircle },
  { label: "Shop", path: "/shop", icon: ShoppingBag },
  { label: "Events", path: "/events", icon: Music },
  { label: "Academy", path: "/academy", icon: Star },
  { label: "Editing Suite", path: "/editing", icon: Mic },
  { label: "Radio", path: "/radio", icon: Radio },
  { label: "Info & Rules", path: "/info", icon: MapPin },
  { label: "Pricing", path: "/pricing", icon: FileText },
  { label: "Session Log", path: "/log", icon: FileText },
  { label: "Tour", path: "/tour", icon: MapPin },
];

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hidden = pathname.startsWith("/auth") || pathname.startsWith("/admin") || pathname.startsWith("/unlock");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (hidden) return null;

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, help articles..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)} className="cursor-pointer">
              <p.icon className="mr-2 h-4 w-4" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Help Articles">
          {helpArticles.slice(0, 20).map((a) => (
            <CommandItem key={a.slug} onSelect={() => go(`/help/${a.slug}`)} className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              {a.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
