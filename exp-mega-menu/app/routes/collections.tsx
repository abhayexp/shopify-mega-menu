import { LoaderFunction, json } from '@remix-run/node';
import dotenv from "dotenv";
dotenv.config();

const shop = process.env.SHOP_URL;
const version = process.env.API_VERSION;
const ADMIN_API_TOKEN = process.env.ADMIN_TOKEN;

export const loader: LoaderFunction = async () => {
  try {
    if (!ADMIN_API_TOKEN) {
      throw new Error("Missing Shopify Admin API token");
    }

    const response = await fetch(`https://${shop}/admin/api/${version}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_API_TOKEN,
      },
      body: JSON.stringify({
        query: `
          query GetCollections {
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        `
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Response(`Shopify API Error: ${error}`, { status: response.status });
    }

    const result = await response.json();
    const collections = result.data.collections.edges.map((edge: any) => edge.node);

    return json({ collections });

  } catch (error: any) {
    console.error("Loader Error:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};
