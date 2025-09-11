import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const SHOP = process.env.SHOP;
const TOKEN = process.env.TOKEN; // your admin API token

export const uploadFileToShopify = async (file) => {
  const mutation = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          alt
          ... on MediaImage {
            image {
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    files: [
      {
        alt: file.originalname,
        contentType: "IMAGE",
        originalSource: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      },
    ],
  };

  const response = await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL Errors:", data.errors);
    throw new Error("Shopify GraphQL error");
  }

  if (!data.data || data.data.fileCreate.userErrors.length) {
    console.error("Shopify upload error:", data.data?.fileCreate?.userErrors);
    throw new Error("Failed to upload to Shopify");
  }

  return data.data.fileCreate.files[0].image.url;
};
