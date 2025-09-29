import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const body = await request.json();
  const { plan } = body;

  const plans = {
    free: { name: "Free", amount: 0 },
    pro: { name: "Pro Plan", amount: 100 }, // example ₹100
  };

  const returnUrl = `https://${shop}/admin/apps/exp-mega-menu/app`;
  const chosenPlan = plans[plan] || plans.free;

  const billingResponse = await admin.graphql(
    `#graphql
    mutation AppSubscriptionCreate(
      $name: String!, 
      $lineItems: [AppSubscriptionLineItemInput!]!, 
      $returnUrl: URL!, 
      $test: Boolean
    ) {
      appSubscriptionCreate(  
        name: $name, 
        returnUrl: $returnUrl, 
        test: $test, 
        lineItems: $lineItems
      ) {
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
        returnUrl,
        test: true,
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

  const result = await billingResponse.json();
  const subscriptionData = result?.data?.appSubscriptionCreate;

  console.log("Subscription Data:", subscriptionData?.appSubscription?.id);

    return json({
      confirmationUrl: subscriptionData.confirmationUrl,
    userErrors: subscriptionData.userErrors,
  });
}