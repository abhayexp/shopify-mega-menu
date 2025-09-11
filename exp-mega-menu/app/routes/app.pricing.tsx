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
        <Card title="Basic Plan" sectioned>
          <p style={{ fontWeight: "600", fontSize: "16px" }}>$5 / month</p>
          <ul>
            <li>Basic feature 1</li>
            <li>Basic feature 2</li>
          </ul>
          <Button primary onClick={() => handleSubscribe("free")}>
            Activate
          </Button>
        </Card>

        <Card title="Pro Plan" sectioned>
          <p style={{ fontWeight: "600", fontSize: "16px" }}>$19 / month</p>
          <ul>
            <li>Advanced feature 1</li>
            <li>Advanced feature 2</li>
          </ul>
          <Button primary onClick={() => handleSubscribe("pro")}>
            Subscribe
          </Button>
        </Card>
 
        <Card title="Enterprise Plan" sectioned>
          <p style={{ fontWeight: "600", fontSize: "16px" }}>$49 / month</p>
          <ul>
            <li>All features included</li>
            <li>Priority support</li>
          </ul>
          <Button primary onClick={() => handleSubscribe("enterprise")}>
            Subscribe
          </Button>
        </Card>
      </div>
    </Page>
  );
}