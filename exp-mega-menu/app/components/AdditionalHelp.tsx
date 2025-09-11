import React from "react";
import { Card, BlockStack, Text, InlineGrid, Link, Icon } from "@shopify/polaris";
import { EmailMajor, ChatMajor, NotesMajor } from "@shopify/polaris-icons";

export default function AdditionalHelp() {
  const helpOptions = [
    {
      icon: EmailMajor,
      title: "Get email support",
      description: "Email us and we'll get back to you as soon as possible.",
      linkLabel: "Open email",
      linkUrl: "#", // replace with your email link
    },
    {
      icon: ChatMajor,
      title: "Start live chat",
      description: "Talk to us directly via live chat to get help with your question.",
      linkLabel: "Open chat",
      linkUrl: "#", // replace with your chat link
    },
    {
      icon: NotesMajor,
      title: "Help docs",
      description: "Find a solution for your problem with documents and tutorials.",
      linkLabel: "Open docs",
      linkUrl: "#", // replace with your docs link
    },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Explore additional help</Text>
        <Text as="p" variant="bodyMd">Need any help?</Text>

        <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
          {helpOptions.map((option, index) => (
            <Card key={index} padding="400" background="bg-surface-secondary">
              <BlockStack gap="200">
                <Icon source={option.icon} tone="base" />
                <Text variant="headingSm" as="h3">{option.title}</Text>
                <Text as="p" variant="bodyMd">{option.description}</Text>
                <Link url={option.linkUrl} removeUnderline>{option.linkLabel}</Link>
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>
      </BlockStack>
    </Card>
  );
}
