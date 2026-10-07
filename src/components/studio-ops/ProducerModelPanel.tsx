import { BookOpen, Scale, Award, Info, FileText } from "lucide-react";
import { StudioOpsCard, StudioOpsSection } from "./StudioOpsPrimitives";

export const ProducerModelPanel = () => {
  return (
    <StudioOpsSection title="Producer Business Model & Space Rules" eyebrow="Internal policy" icon={BookOpen}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Client Generation & Revenue Sharing */}
        <StudioOpsCard className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Award className="w-5 h-5 text-primary" />
            <h4 className="font-bebas text-lg tracking-wide text-foreground">Client Ownership & Service Rates</h4>
          </div>
          <ul className="space-y-2 text-xs font-barlow text-muted-foreground leading-relaxed">
            <li>
              • <strong className="text-foreground">Dual Channels:</strong> Producers can bring their own personal clients, and they can also receive clients generated directly by the Fully Governed website.
            </li>
            <li>
              • <strong className="text-foreground">Custom Service Rates:</strong> Producers are free to establish their own rates and services. Studio-generated clients will book based on rate cards configured in their dashboard.
            </li>
            <li>
              • <strong className="text-foreground">Space Hire Dues:</strong> Producers may be required to pay a flat fee or standard space rate to use the rooms depending on the room setup layouts.
            </li>
          </ul>
        </StudioOpsCard>

        {/* Staffing, Liability & Penalties */}
        <StudioOpsCard className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Scale className="w-5 h-5 text-primary" />
            <h4 className="font-bebas text-lg tracking-wide text-foreground">Staff Responsibility & Liability</h4>
          </div>
          <ul className="space-y-2 text-xs font-barlow text-muted-foreground leading-relaxed">
            <li>
              • <strong className="text-foreground">Team Governance:</strong> Producers are entirely responsible for their own team, staff, and external guests introduced during their booked sessions.
            </li>
            <li>
              • <strong className="text-foreground">Financial Damage Liability:</strong> Producers are held fully financially liable for any damage caused to the studio, setups, or equipment by anyone they bring to the space.
            </li>
            <li>
              • <strong className="text-foreground">Studio Enforcement:</strong> Studio management reserves the right to issue official warnings, monetary penalties, or immediate bans depending on the severity of policy breaches.
            </li>
          </ul>
        </StudioOpsCard>
      </div>
    </StudioOpsSection>
  );
};
