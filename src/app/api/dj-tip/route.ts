import { NextRequest, NextResponse } from "next/server"
import { DJ_TIP_TIER_MAP } from "lib/tiers"
import { createPaymentLink } from "lib/square"

export async function POST(req: NextRequest) {
  const { requestId, tipAmount } = await req.json()

  if (!requestId || !tipAmount) {
    return NextResponse.json({ error: "Missing requestId or tipAmount" }, { status: 400 })
  }

  const tier = DJ_TIP_TIER_MAP[String(tipAmount)]
  if (!tier) {
    return NextResponse.json({ error: "Invalid tip amount" }, { status: 400 })
  }

  try {
    const url = await createPaymentLink({
      amountCents: tier.amountCents,
      label: tier.apiLabel,
      metadata: { request_id: requestId, tip_amount: String(tipAmount) },
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/queue?tip_success=true`,
    })
    return NextResponse.json({ url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Square error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
