import { Page, Card, Button } from "@shopify/polaris";
 
export default function Pricing() {
 
const handleSubscribe = async (plan :any) => {

    console.log("Subscribing to plan:", plan );
        const response = await fetch("/app/billing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { confirmationUrl } = await response.json();
    console.log("Received response from subscribe action:", confirmationUrl);
    if (window.top) {
      window.top.location.href = confirmationUrl;
    } else {
      window.location.href = confirmationUrl;
    }
};

 
  return (
    <Page title="Billing Plans" subtitle="Choose the plan that fits your needs">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        <Card title="Free Plan" sectioned>
          <p style={{ fontWeight: "600", fontSize: "16px" }}>Free</p>
          <ul>
            <li>Multi-level Navigation</li>
            <li>Menu Types</li>
            <li>Responsive Design</li>
            <li> Image & Banner Support</li>
            <li>Dynamic Content</li>
          </ul>
        </Card>

        <Card title="Pro Plan" sectioned>
          <p style={{ fontWeight: "600", fontSize: "16px" }}>$19 / month</p>
          <ul>
            <li> Free plan + More than 3 menus</li>
          </ul>
          <Button primary onClick={() => handleSubscribe("pro")}>
            Subscribe
          </Button>
        </Card>

      </div>
    </Page>
  );
}