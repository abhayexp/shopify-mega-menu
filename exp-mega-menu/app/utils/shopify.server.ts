// shopify.server.ts
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES!.split(','),
  hostName: process.env.SHOPIFY_APP_URL!.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: new PrismaSessionStorage(prisma,{
    // Optional: Configure session storage options
    // For example, you can set a custom table name
    tableName: 'Session',
  }),
});

// ✅ Auth helper for admin requests
export async function authenticateAdmin(request: Request) {
  console.log(await shopify.session.getCurrentId({
    isOnline: false,
    rawRequest: request,
  }));
  
  const sessionId = await shopify.session.getCurrentId({
    isOnline: false,
    rawRequest: request,
  });

  if (!sessionId) throw new Error('No session ID found');

  const session = await shopify.config.sessionStorage.loadSession(sessionId);

  if (!session) throw new Error('Session not found for session ID');

  const admin = new shopify.clients.Graphql({ session });

  return { admin, session };
}

export { shopify };
