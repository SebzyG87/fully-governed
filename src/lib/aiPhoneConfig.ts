// AI Phone System Configuration
// Integration-ready structure for Fully Governed's AI reception/call answering.
// Nothing here is live until the owner selects a provider and connects it.

export const AI_PHONE_PROVIDERS = [
  { id: "bland_ai",     label: "Bland AI",     url: "https://bland.ai",       notes: "Outbound + inbound, booking flows, human handoff" },
  { id: "retell_ai",    label: "Retell AI",     url: "https://retellai.com",   notes: "Conversational voice, easy webhook integration" },
  { id: "vapi",         label: "Vapi",          url: "https://vapi.ai",        notes: "Developer-friendly, real-time voice AI" },
  { id: "elevenlabs",   label: "ElevenLabs",    url: "https://elevenlabs.io",  notes: "High-quality voice synthesis, conversational flows" },
  { id: "synthflow",    label: "Synthflow",     url: "https://synthflow.ai",   notes: "No-code voice AI builder" },
] as const;

export type AiPhoneProviderId = typeof AI_PHONE_PROVIDERS[number]["id"];

// Call event types the platform is prepared to log
export const AI_CALL_EVENT_TYPES = [
  "inbound_answered",
  "inbound_missed",
  "outbound_completed",
  "outbound_failed",
  "booking_enquiry_captured",
  "follow_up_scheduled",
  "human_handoff_requested",
] as const;

// Booking enquiry statuses
export const BOOKING_ENQUIRY_STATUSES = [
  "none",
  "interested",
  "booked",
  "follow_up_needed",
  "not_interested",
] as const;

// Integration checklist — what needs to be done before AI calls go live
export const AI_PHONE_SETUP_CHECKLIST = [
  { step: 1, item: "Choose AI phone provider from the list above", done: false },
  { step: 2, item: "Register building phone number with the provider", done: false },
  { step: 3, item: "Configure call script / knowledge base for studio services, pricing, and availability", done: false },
  { step: 4, item: "Set up webhook endpoint to receive call events (deploy ai-call-webhook edge function)", done: false },
  { step: 5, item: "Update fg_studio_settings.ai_provider and fg_studio_settings.building_phone in Supabase", done: false },
  { step: 6, item: "Connect missed-call follow-up to fg_email_queue (send_email edge function)", done: false },
  { step: 7, item: "Test with a real call before going live", done: false },
];

// Placeholder display config for the AI Admin Panel UI
export const AI_ADMIN_PANEL_CONFIG = {
  integrationStatus: "not_configured" as "not_configured" | "configured" | "live",
  displayMessage: "AI phone answering is integration-ready. Select a provider and complete the setup checklist to go live.",
  buildingPhone: null as string | null,
  selectedProvider: null as AiPhoneProviderId | null,
};
