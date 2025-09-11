  import { json, redirect } from "@remix-run/node";
  import { authenticate } from "../shopify.server";
  import test from "node:test";
  
  export async function action({ request }) {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;
  
    const body = await request.json();
    const { plan } = body;
    const plans = {
      free: { name: "Base Plan", amount: 0.1 },
      pro: { name: "Pro Plan", amount: 0.2 },
      enterprise: { name: "Enterprise Plan", amount: 0.3 },
    };
    const returnUrl = `https://admin.shopify.com/store/${shop}/apps/bulk-order-20/billing/confirm`;
    const chosenPlan = plans[plan] || plans.free;
      
  const response = await admin.graphql(
    `#graphql
    mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`,
      {
        variables: {
          name: chosenPlan.name,
          returnUrl: returnUrl,
          test: true,
          trialDays : 7,  
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: chosenPlan.amount,
                    currencyCode: "INR",
                  },
                  interval: "EVERY_30_DAYS",
                },
              },
            },
          ],
        },
      }
    );

  const result = await response.json();
  const subscriptionData = result?.data?.appSubscriptionCreate;
    return json({
      confirmationUrl: subscriptionData.confirmationUrl,
      userErrors: subscriptionData.userErrors,
    });
  }