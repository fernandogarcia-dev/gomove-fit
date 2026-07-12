import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "./_lib/stripe";
import { getSupabaseAdmin, getUserFromAuthHeader } from "./_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getUserFromAuthHeader(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const origin = req.headers.origin ?? process.env.APP_URL ?? "https://gomove.fit";

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("provider_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.provider_customer_id) {
      return res.status(400).json({ error: "No billing account found for this user yet" });
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: sub.provider_customer_id,
      return_url: `${origin}/pro`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error("create-portal-session failed", error);
    return res.status(500).json({ error: "Could not open billing portal" });
  }
}
