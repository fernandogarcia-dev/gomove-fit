import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "./_lib/stripe";
import { getSupabaseAdmin, getUserFromAuthHeader } from "./_lib/supabase-admin";

const PRICE_BY_INTERVAL: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getUserFromAuthHeader(req.headers.authorization);
  if (!user || !user.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const interval = (req.body?.interval as string) ?? "monthly";
  const priceId = PRICE_BY_INTERVAL[interval];
  if (!priceId) {
    return res.status(400).json({ error: `No price configured for interval "${interval}"` });
  }

  const origin = req.headers.origin ?? process.env.APP_URL ?? "https://gomove.fit";

  try {
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("provider_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingSub?.provider_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("subscriptions")
        .update({ provider: "stripe", provider_customer_id: customerId })
        .eq("user_id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      allow_promotion_codes: true,
      success_url: `${origin}/pro?checkout=success`,
      cancel_url: `${origin}/pro?checkout=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session failed", error);
    return res.status(500).json({ error: "Could not start checkout" });
  }
}
