import { PageHeader } from "~/components/PageHeader";

export const meta = () => {
  return [{ title: "Inbound Email - Remix + Resend" }];
};

export default function Inbound() {
  return (
    <div>
      <PageHeader
        title="Inbound Email"
        description="Receive and process inbound emails using Resend webhooks."
      />

      <div style={sectionStyle}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>How It Works</h2>
        <ol style={{ lineHeight: "1.8", paddingLeft: "20px" }}>
          <li>
            Configure your domain MX records to point to Resend for inbound email
            processing.
          </li>
          <li>
            Set up a webhook endpoint to receive <code>email.received</code>{" "}
            events.
          </li>
          <li>
            The webhook payload contains the sender, recipients, subject, and
            email body.
          </li>
          <li>
            Use <code>resend.emails.get(emailId)</code> to retrieve the full
            email content if needed.
          </li>
        </ol>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Webhook Setup</h2>
        <p style={{ lineHeight: "1.6" }}>
          The <code>/api/webhook</code> route in this app already handles
          inbound email events. Configure your Resend webhook to point to your
          deployment URL:
        </p>
        <div style={urlBoxStyle}>
          <code>https://your-app.com/api/webhook</code>
        </div>
        <p style={{ lineHeight: "1.6", color: "#71717a", fontSize: "14px" }}>
          Make sure to select the <strong>email.received</strong> event type
          when configuring your webhook in the Resend dashboard.
        </p>
      </div>

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
          Webhook Handler Code
        </h3>
        <pre style={preStyle}>{`// In app/routes/api.webhook.js
export async function action({ request }) {
  const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
  const body = await request.json();
  const payload = JSON.stringify(body);

  wh.verify(payload, {
    "svix-id": request.headers.get("svix-id"),
    "svix-timestamp": request.headers.get("svix-timestamp"),
    "svix-signature": request.headers.get("svix-signature"),
  });

  if (body.type === "email.received") {
    console.log("New email from:", body.data?.from);
    // Process the inbound email...
  }

  return json({ received: true });
}`}</pre>
      </div>

      <div style={{ ...codeBlockStyle, marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
          Fetching Inbound Email
        </h3>
        <pre style={preStyle}>{`// Fetch a previously received inbound email by ID
const { data: email, error } = await resend.emails.get(emailId);

console.log("From:", email.from);
console.log("To:", email.to);
console.log("Subject:", email.subject);
console.log("Body:", email.text);`}</pre>
      </div>
    </div>
  );
}

const sectionStyle = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#fff",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
};

const urlBoxStyle = {
  padding: "12px 16px",
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
  margin: "12px 0",
  fontSize: "14px",
};

const codeBlockStyle = {
  marginTop: "32px",
  padding: "20px",
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#e4e4e7",
};

const preStyle = {
  margin: 0,
  fontSize: "13px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};
