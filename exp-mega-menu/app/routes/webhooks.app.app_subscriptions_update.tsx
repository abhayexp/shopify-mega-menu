import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
// import db from "../db.server";
 
export const action = async ({ request }) => {
  console.log("subscription webhook called");
  const { topic, shop, payload } = await authenticate.webhook(request);
  if (topic === "APP_SUBSCRIPTIONS_UPDATE") {
    try {
      const subscription = payload?.app_subscription;
      if (subscription) {
        let activePlan = null;
        if (subscription.status === "ACTIVE") {
          activePlan = subscription.name;
        } else if (
          subscription.status === "CANCELLED" ||
          subscription.status === "PENDING_CANCEL"
        ) {
          activePlan = "FREE_PLAN";
        }
        // await db.shop.upsert({
        //   where: { shop },
        //   update: { plan: activePlan },
        //   create: { shop, plan: activePlan, accessToken: "" },
        // });
 
        console.log(
          `DB updated for ${shop}, status: ${subscription.status}, plan: ${activePlan}`
        );
      } else {
        console.warn("No subscription data in webhook payload");
      }
    } catch (err) {
      console.error("Error updating DB from webhook:", err);
    }
  }
 
  return json({ ok: true });
};