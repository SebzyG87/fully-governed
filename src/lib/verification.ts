export const VERIFICATION_STATUSES = [
  "not_required",
  "required",
  "pending",
  "verified",
  "rejected",
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[number];

export const VERIFICATION_STATUS_META: Record<VerificationStatus, { label: string; description: string }> = {
  not_required: {
    label: "Not required",
    description: "This booking can proceed without ID or guest verification.",
  },
  required: {
    label: "Required",
    description: "Verification must be requested before the booking can move forward.",
  },
  pending: {
    label: "Pending",
    description: "Client or guest verification has been submitted and is awaiting review.",
  },
  verified: {
    label: "Verified",
    description: "Verification has been approved.",
  },
  rejected: {
    label: "Rejected",
    description: "Verification was rejected and needs manual follow-up.",
  },
};

export const serviceRequiresVerification = (sessionType: string) => {
  const lower = sessionType.toLowerCase();
  return lower.includes("unknown client") || lower.includes("late night") || lower.includes("large group");
};

