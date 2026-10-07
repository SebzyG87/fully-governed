export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  skills: string[];
  ratePlaceholder: string;
  availabilityPlaceholder: string;
  portfolio: string[];
  socialLinks: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    spotify?: string;
    youtube?: string;
    website?: string;
  };
  serviceCategories: {
    title: string;
    items: string[];
  }[];
  tone: string;
  availabilityNotes: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: "mono-luke",
    name: "Mono Luke",
    role: "Producer & Creative Lead",
    bio: "Mono Luke is a versatile creative producer specializing in music production, mixing/mastering, 3D modeling, and dynamic motion graphics. As an engineer and visual designer, Mono brings ideas to life across auditory, design, and physical mediums.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    skills: ["Music Production", "Mixing & Mastering", "3D Modelling", "Motion Graphics", "VFX", "Audio Engineering", "Graphic Design"],
    ratePlaceholder: "Request a quote",
    availabilityPlaceholder: "Monday - Friday (10:00 - 18:00)",
    portfolio: ["Demo Project: Boiler Room Live Mix", "Motion Graphic: Lyric Video Concept", "3D Model: Studio Synth Showcase", "Single Cover Art Showcase"],
    socialLinks: {
      instagram: "https://instagram.com/monoluke",
      spotify: "https://spotify.com/artist/monoluke",
      youtube: "https://youtube.com/monoluke",
    },
    serviceCategories: [
      {
        title: "Music & Audio",
        items: [
          "Music Mixing",
          "Music Mastering",
          "Music Production",
          "Music Engineering",
          "Recording Engineering",
          "Vocal Recording",
          "Session Engineering",
          "Audio Cleanup",
          "Podcast Audio Editing"
        ]
      },
      {
        title: "Video & Motion",
        items: [
          "Video Editing",
          "Video Effects",
          "Visual Effects",
          "Motion Graphics",
          "Lyric Videos",
          "Music Video Editing",
          "Podcast Video Editing",
          "YouTube Content Editing",
          "Social Media Content Editing"
        ]
      },
      {
        title: "Design",
        items: [
          "Graphic Design",
          "Album Artwork",
          "Single Covers",
          "Flyer Design",
          "Social Media Graphics",
          "Branding Assets"
        ]
      },
      {
        title: "3D / Product",
        items: [
          "3D Modelling",
          "3D Asset Creation",
          "Product Visualisation",
          "3D Printing",
          "3D Printing Preparation",
          "Prototype Design"
        ]
      }
    ],
    tone: "Multi-skilled creative producer who can support music, visuals, design, and 3D work.",
    availabilityNotes: "General booking response within 4 hours. Preferred sessions are weekday afternoons."
  },
  {
    slug: "seb-green",
    name: "Sebastian Green",
    role: "Creative Systems & Operations Director",
    bio: "Sebastian Green operates behind the scenes designing studio systems, custom software architectures, and automated production pipelines. Sebastian helps artists and organizations scale through content strategy, web platforms, and smooth workflow consulting.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    skills: ["Workflow Automation", "Systems Architecture", "Content Strategy", "Software Engineering", "Livestream Systems", "Brand Campaigns"],
    ratePlaceholder: "Consultation rates on request (POA)",
    availabilityPlaceholder: "By Appointment Only (Flexible)",
    portfolio: ["Project: Studio Ops Automation Hub", "Ecosystem Strategy Briefing", "Livestream Infrastructure Setup", "Campaign Concept: Artist Launch"],
    socialLinks: {
      instagram: "https://instagram.com/sebgreen",
      linkedin: "https://linkedin.com/in/sebgreen",
      website: "https://www.fullygoverned.co.uk",
    },
    serviceCategories: [
      {
        title: "Video & Content",
        items: [
          "Video Editing",
          "Motion Graphics",
          "Content Strategy",
          "Social Media Content",
          "Podcast Production",
          "Marketing Assets",
          "Event Coverage",
          "Livestream Production"
        ]
      },
      {
        title: "Web & Digital",
        items: [
          "Website Development",
          "Booking Systems",
          "Dashboard Systems",
          "Mobile App Planning",
          "Custom Software Planning",
          "Digital Business Systems"
        ]
      },
      {
        title: "Business & Operations",
        items: [
          "Business Systems",
          "Operations Design",
          "Process Automation",
          "Digital Transformation",
          "Startup Consulting",
          "CRM & Workflow Planning"
        ]
      },
      {
        title: "Creative Direction",
        items: [
          "Creative Direction",
          "Campaign Planning",
          "Brand Strategy",
          "Release Campaigns",
          "Artist Development Campaigns",
          "Content Rollout Planning"
        ]
      }
    ],
    tone: "Behind-the-scenes creative systems and content expert, specializing in automation and strategy rather than traditional studio engineering.",
    availabilityNotes: "Ad-hoc bookings accepted for strategic consultations. Direct outreach required."
  },
  {
    slug: "future-producer-template",
    name: "Future Producer",
    role: "Producer / Specialist",
    bio: "Template profile for future Fully Governed producers, engineers, and creative specialists. This slot can be activated when a new person joins the team.",
    avatar: "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&q=80&w=400",
    skills: ["Production", "Engineering", "Creative Direction"],
    ratePlaceholder: "Rates TBC",
    availabilityPlaceholder: "Availability TBC",
    portfolio: ["Portfolio to be added"],
    socialLinks: {},
    serviceCategories: [
      {
        title: "Services",
        items: ["Add services in admin"]
      }
    ],
    tone: "Future producer template for new team members.",
    availabilityNotes: "Activate when a producer profile is approved."
  }
];
