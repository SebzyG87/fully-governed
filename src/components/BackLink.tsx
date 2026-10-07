import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  to: string;
  label: string;
  className?: string;
}

const BackLink = ({ to, label, className }: BackLinkProps) => (
  <Link
    to={to}
    className={cn(
      "inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      className
    )}
  >
    <ArrowLeft className="h-4 w-4" />
    <span className="font-barlow">{label}</span>
  </Link>
);

export default BackLink;
