import type { VercelRequest, VercelResponse } from "@vercel/node";
import type Stripe from "stripe";
import { getStripe } from "./_lib/stripe";
import { getSupabaseAdmin } from "./_lib/supabase-admin";

// Stripe needs the raw request body to verify the webhook signature.
export const config = {
  api: { bodyParser: false },
};

const readRawBody = (req: VercelRequest): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

// Maps Stripe subscription statuses to the smaller set stored in our `subscriptions` table.
const mapStatus = (stripeStatus: Stripe.Subscription.Status): string => {
  switch (stripeStatus) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
      return stripeStatus;
    default:
      return "inactive";
  }
};

const upsertFromSubscription = async (subscription: Stripe.Subscription) => {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.warn("Stripe subscription without supabase_user_id metadata", subscription.id);
    return;
  }

  const status = mapStatus(subscription.status);
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  await getSupabaseAdmin()
    .from("subscriptions")
    .update({
      plan: status === "active" || status === "trialing" ? "pro" : "free",
      status,
      provider: "stripe",
      provider_customer_id: String(subscription.customer),
      provider_subscription_id: subscription.id,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
    })
    .eq("user_id", userId);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(400).json({ error: "Missing Stripe signature or webhook secret" });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(
            String(session.subscription),
          );
          await upsertFromSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertFromSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
