import { useEffect } from "react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
// import db from "../db.server";

export const action = async ({ request }) => {
  console.log("subscription webhook called");
  const { topic, shop, payload } = await authenticate.webhook(request);
  if (topic === "APP_SUBSCRIPTIONS_UPDATE") {
    try {
      const subscription = payload?.app_subscription;
      console.log("Webhook payload:", subscription);

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
        console.log(
          `DB updated for ${shop}, status: ${subscription.status}, plan: ${activePlan}, valid_until: ${subscription.current_period_end}`,
        );
        const planData = {
          shopifyDomain: shop,
          subscriptionId: subscription.admin_graphql_api_id,
          plan: subscription.name,
          status: subscription.status,
          validUntil: subscription.current_period_end,
          interval: subscription.interval,
        };
        console.log("Plan data:", planData);

        //  Db Operation
        try {
          const res = await fetch(
            "http://localhost:5000/api/app-subscription",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(planData),
            },
          );
          console.log("Response status:", res);
          const result = await res.json();
          console.log("Update plan response:", result);
        } catch (error) {
          console.log("Error updating subscription in DB:", error);
        }
      } else {
        console.warn("No subscription data in webhook payload");
      }
    } catch (err) {
      console.error("Error updating DB from webhook:", err);
    }
  }
  return json({ ok: true });
};
