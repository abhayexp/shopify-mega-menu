// app/routes/app.tsx
import { Outlet, useLoaderData, useRouteError , Link } from "@remix-run/react";
// index.js or App.jsx
import '@shopify/polaris/build/esm/styles.css';
import { AppProvider as PolarisProvider, Frame , Navigation } from "@shopify/polaris";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";

import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import type { LoaderFunctionArgs, HeadersFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  return {
    apiKey: process.env.SHOPIFY_API_KEY!,
    host: url.searchParams.get("host") || "",
  };
};

export default function App() {
  const { apiKey, host } = useLoaderData<typeof loader>();

  return (  
     <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
        {/* <Link to="/app/pricing">Pricing </Link> */}
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// export function ErrorBoundary() {
//   return boundary.error(useRouteError());
// }

// export const headers: HeadersFunction = (args) => boundary.headers(args);
