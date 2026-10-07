export const STRIPE_INTEGRATION_PLAN = {
  requiredEnvVars: [
    "VITE_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
  ],
  productsNeeded: [
    "Studio dry hire packages",
    "Recording with producer packages",
    "Podcast session packages",
    "Content room packages",
    "Artist development sessions",
    "Add-ons and extras",
    "Overtime extensions",
    "Deposits",
  ],
  webhookEndpointPlan: "/supabase/functions/stripe-webhook",
  flows: [
    "Deposit payment flow: create checkout for deposit amount, mark booking deposit_paid on webhook success.",
    "Full payment flow: create checkout for full amount, mark booking paid on webhook success.",
    "Balance payment flow: charge outstanding balance before or on arrival.",
    "Overtime flow: require admin/producer approval, create overtime charge, update overtime_due/paid.",
    "Refund flow: admin triggers refund in Stripe, webhook updates refund status.",
  ],
  testModeChecklist: [
    "Use Stripe test keys only.",
    "Verify checkout success redirects.",
    "Verify cancelled checkout returns to booking.",
    "Verify webhook signature validation.",
    "Verify failed payment event records payment status failed.",
    "Verify no client can alter payment status directly.",
  ],
};
