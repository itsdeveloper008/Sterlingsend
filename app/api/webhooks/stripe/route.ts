import { NextResponse } from "next/server";
import { stripeService } from "@/services/stripe.service";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  try {
    const event = stripeService.verifyWebhookSignature(
      body,
      signature,
      webhookSecret,
    );

    await stripeService.processWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
