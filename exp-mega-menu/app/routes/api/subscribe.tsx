import { json } from "@remix-run/node";

// Handle POST request
export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return json({ success: false, error: "Plan is required" }, { status: 400 });
    }

    return json({ success: true, message: `Subscribed to ${plan}` });
  } catch (err) {
    return json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function loader() {
  return json({ message: "This is the subscribe API" });
}
