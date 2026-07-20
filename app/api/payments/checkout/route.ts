import { NextResponse } from "next/server";
import { stripeService } from "@/services/stripe.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { publicToken?: string };
    if (!body.publicToken) {
      return NextResponse.json({ error: "Missing public token" }, { status: 400 });
    }

    const result = await stripeService.createCheckoutSession(body.publicToken);
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[api/payments/checkout]", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 400 },
    );
  }
}
