import {Page, Button, LegacyCard} from '@shopify/polaris';
import React from 'react';

export default function SliderDetailsPage() {
  return (
    <Page
      backAction={{content: 'Settings', url: '#'}}
      title="General"
      primaryAction={<Button variant="primary">Save</Button>}
    >
      <LegacyCard title="Credit card" sectioned>
        <p>Credit card information</p>
      </LegacyCard>
    </Page>
  );
}