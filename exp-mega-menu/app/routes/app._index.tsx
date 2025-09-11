import { useCallback, useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  LegacyStack,
  CalloutCard
} from "@shopify/polaris";
import TreeModal from "app/components/TreeModal";
import TreeNode from "app/components/TreeNode";
import MegaMenuFullScreenLayout from "app/components/MegaMenuFull";
import { motion } from "framer-motion";

// import GoToMenusButton from "app/components/GoToMenusButton";
import MenuGrid from "app/components/MenuGrid";

export default function Index() {

  const [showModal, setShowModal] = useState(false);
  const handleClick = useCallback(() => setShowModal(true), []);

  return (
    <Page>
      {/* <h2 className="mb-2"> GLobo Mega Menu</h2> */}
      <div style={{ marginBottom: '30px', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <span role="img" aria-label="wave" style={{ marginRight: '8px' }}>👋</span>
        <span>Welcome to </span>
        <span
          style={{
            background: 'linear-gradient(to right, #6a11cb, #ff0080)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginLeft: '5px',
          }}
        >
          Exp Mega Menu
        </span>
      </div>


      <CalloutCard
        title="✨ Customize your Mega Menu Experience"
        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
        primaryAction={{
          content: 'Get Started',
          onAction: () => setShowModal(true), 
        }}
      >
        <p style={{ fontSize: '14px', color: '#4a4a4a' }}>
          Make your storefront navigation shine with custom layouts, icons, and dropdowns. 
          Launch the menu builder to start designing now.
        </p>
      </CalloutCard>

      {/* {showModal &&<TreeModal /> } */}
      <MegaMenuFullScreenLayout></MegaMenuFullScreenLayout>


    </Page>
  );
}
