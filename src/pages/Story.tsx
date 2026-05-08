import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const timeline = [
  { year: "2019", title: "THE VISION", text: "Born from a simple idea: give South East London's artists a home. Not just a studio — a community." },
  { year: "2020", title: "BUILDING THROUGH THE STORM", text: "While the world paused, we built. Soundproofing, wiring, designing — brick by brick in the V22 Building, Lewisham." },
  { year: "2021", title: "DOORS OPEN", text: "Our first session. Three rooms. One mission. The Recording Studio, Multi-Use Room, and Content Creation Suite went live." },
  { year: "2022", title: "THE FAMILY GROWS", text: "Word spread. Artists, producers, podcasters, and creatives from across London discovered their new creative home." },
  { year: "2023", title: "COMMUNITY FIRST", text: "Events, open mic nights, and collaborations. The Collabo Board launched. Fully Governed became more than a studio — it became a movement." },
  { year: "2024", title: "LEVELLING UP", text: "Equipment upgrades, new partnerships, and the Beat Academy programme. Investing in the next generation of talent." },
  { year: "2025", title: "THE FUTURE", text: "Digital expansion, the Vinyl Vault, and our vision for the most connected creative community in London. This is just the beginning." },
];

const roadmap = [
  { phase: "1", title: "Foundation", status: "✅ Complete", items: "Studio build, soundproofing, core equipment, booking system, website v1" },
  { phase: "2", title: "Community", status: "✅ Complete", items: "Collabo Board, member profiles, loyalty points, events system, Help Centre" },
  { phase: "3", title: "Content Hub", status: "✅ Complete", items: "Creation Center (gaming, podcasting, modelling, shows), Editing Suite expansion" },
  { phase: "4", title: "Commerce", status: "🔄 In Progress", items: "Digital Vinyl store, Shop sub-categories, My Clothing print-on-demand, USB bundles" },
  { phase: "5", title: "Label Services", status: "🔄 In Progress", items: "My Label dashboard, distribution, marketing campaigns, legal tools, finance tracking" },
  { phase: "6", title: "Street Team & Social", status: "📋 Planned", items: "Street Team recruitment, tasks & rewards, Artist Social Hub, follow system, DMs" },
  { phase: "7", title: "AI & Advanced", status: "📋 Planned", items: "Marketing AI Strategy Tool, Synergy Match, booking notifications, PWA offline mode" },
];

const Story = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <div className="grain-overlay" />
    <div className="container pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Est. 2019</p>
        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">OUR STORY</h1>
        <p className="text-muted-foreground font-barlow mt-2 max-w-xl mx-auto">
          From a vision in Lewisham to London's most connected creative community.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto relative mb-20">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
        {timeline.map((item, i) => (
          <motion.div
            key={item.year}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-16 pb-12"
          >
            <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-primary border-4 border-background" />
            <p className="font-mono text-xs text-primary tracking-wider">{item.year}</p>
            <h3 className="font-bebas text-2xl text-foreground tracking-wider mt-1">{item.title}</h3>
            <p className="text-muted-foreground font-barlow mt-1">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Development Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="font-bebas text-3xl md:text-5xl text-foreground tracking-wider text-center mb-8">DEVELOPMENT ROADMAP</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Phase</th>
                <th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground">Title</th>
                <th className="text-left p-4 font-bebas text-lg tracking-wider text-foreground hidden md:table-cell">Key Deliverables</th>
                <th className="text-right p-4 font-bebas text-lg tracking-wider text-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="font-barlow">
              {roadmap.map((r, i) => (
                <tr key={r.phase} className={i < roadmap.length - 1 ? "border-b border-border" : ""}>
                  <td className="p-4 text-primary font-mono font-bold">{r.phase}</td>
                  <td className="p-4 text-foreground font-medium">{r.title}</td>
                  <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">{r.items}</td>
                  <td className="p-4 text-right font-mono text-xs">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default Story;
