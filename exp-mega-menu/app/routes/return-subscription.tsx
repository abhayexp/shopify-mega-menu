// app/routes/return-subscription.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  if (!chargeId) throw new Response("Missing charge_id", { status: 400 });

  // Build the GID from charge_id
  const subscriptionId = `gid://shopify/AppSubscription/${chargeId}`;

  // Call Admin API
  const response = await admin.graphql(
    `query getSubscription($id: ID!) {
      appSubscription(id: $id) {
        id
        name
        status
        lineItems {
          plan {
            pricingDetails {
              ... on AppRecurringPricing {
                interval
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }`,
    { variables: { id: subscriptionId } }
  );

  const data = await response.json();
  const subscription = data.data.appSubscription;
  console.log(" Data", data);
  

  // Save subscription info in DB
  // await db.shop.upsert({
  //   where: { shop },
  //   update: { plan: subscription.name.toLowerCase(), status: subscription.status },
  //   create: { shop, plan: subscription.name.toLowerCase(), status: subscription.status },
  // });

  return redirect("/app/dashboard");
}
