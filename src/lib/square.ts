import { SquareClient, SquareEnvironment } from "square"

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Sandbox,
})

type CreatePaymentLinkOptions = {
  amountCents: number
  label: string
  metadata: Record<string, string>
  redirectUrl: string
}

export async function createPaymentLink({ amountCents, label, metadata, redirectUrl }: CreatePaymentLinkOptions) {
  const response = await squareClient.checkout.paymentLinks.create({
    idempotencyKey: crypto.randomUUID(),
    order: {
      locationId: process.env.SQUARE_LOCATION_ID!,
      lineItems: [
        {
          name: label,
          quantity: "1",
          basePriceMoney: {
            amount: BigInt(amountCents),
            currency: "USD",
          },
        },
      ],
      metadata,
    },
    checkoutOptions: { redirectUrl },
  })

  const url = response.paymentLink?.url
  if (!url) throw new Error("Failed to create payment link")
  return url
}
