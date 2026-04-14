export type Tier = {
  amount: number       // dollar amount used for display and API lookup
  amountCents: number  // cents for Square API
  label: string        // user-facing button label
  apiLabel: string     // Square line item name
}

export type SelfieTier = Tier & {
  durationBonus: number // seconds added to selfie screen time (payment link flow)
}

export const BOOST_TIERS: Tier[] = [
  { amount: 2,  amountCents: 200,  label: "$2 — Move up 2 spots",  apiLabel: "Song Boost — Small" },
  { amount: 5,  amountCents: 500,  label: "$5 — Jump to the top",  apiLabel: "Song Boost — Medium" },
  { amount: 10, amountCents: 1000, label: "$10 — Jump to the top", apiLabel: "Song Boost — Jump to the Top" },
]

export const DJ_TIP_TIERS: Tier[] = [
  { amount: 1,  amountCents: 100,  label: "$1",  apiLabel: "DJ Tip — $1" },
  { amount: 3,  amountCents: 300,  label: "$3",  apiLabel: "DJ Tip — $3" },
  { amount: 5,  amountCents: 500,  label: "$5",  apiLabel: "DJ Tip — $5" },
  { amount: 10, amountCents: 1000, label: "$10", apiLabel: "DJ Tip — $10" },
]

export const SELFIE_TIP_TIERS: SelfieTier[] = [
  { amount: 1, amountCents: 100, label: "$1 — +5s",  apiLabel: "Selfie Boost (+5s on screen)",  durationBonus: 5  },
  { amount: 3, amountCents: 300, label: "$3 — +10s", apiLabel: "Selfie Boost (+10s on screen)", durationBonus: 10 },
  { amount: 5, amountCents: 500, label: "$5 — +15s", apiLabel: "Selfie Boost (+15s on screen)", durationBonus: 15 },
]

// Lookup maps keyed by string dollar amount, for use in API routes
export const BOOST_TIER_MAP = Object.fromEntries(BOOST_TIERS.map(t => [String(t.amount), t]))
export const DJ_TIP_TIER_MAP = Object.fromEntries(DJ_TIP_TIERS.map(t => [String(t.amount), t]))
export const SELFIE_TIP_TIER_MAP = Object.fromEntries(SELFIE_TIP_TIERS.map(t => [String(t.amount), t]))
