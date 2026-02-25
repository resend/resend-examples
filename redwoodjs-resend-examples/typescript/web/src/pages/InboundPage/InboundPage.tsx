import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";

const InboundPage = () => {
  return (
    <>
      <MetaTags title="Inbound Emails" description="Receive and process inbound emails with Resend" />

      <PageHeader
        title="Inbound Emails"
        description="Receive emails via webhooks and optionally forward them."
      />

      <div style={setupStyle}>
        <h3 style={sectionHeading}>Setup Steps</h3>
        <ol style={olStyle}>
          <li style={liStyle}>
            <strong>Configure your domain</strong>
            <p style={stepDescription}>
              Add an MX record pointing to Resend, or use your auto-assigned <code style={inlineCodeStyle}>@yourname.resend.app</code> address.
            </p>
          </li>
          <li style={liStyle}>
            <strong>Create a webhook</strong>
            <p style={stepDescription}>
              In the{" "}
              <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Resend dashboard
              </a>
              , add a webhook for the <code style={inlineCodeStyle}>email.received</code> event.
            </p>
          </li>
          <li style={liStyle}>
            <strong>Set up local testing</strong>
            <p style={stepDescription}>Use ngrok or similar to expose your local server:</p>
            <pre style={inlinePreStyle}>ngrok http 8910</pre>
          </li>
        </ol>
      </div>

      <div style={warningStyle}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, color: "#92400e" }}>
          Important Notes
        </h3>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#a16207", lineHeight: "1.8" }}>
          <li>Webhook payloads contain <strong>metadata only</strong>, not the email body</li>
          <li>Always verify webhook signatures to prevent spoofing</li>
          <li>Attachment download URLs expire after <strong>1 hour</strong></li>
          <li>Return a 200 status code or Resend will retry</li>
        </ul>
      </div>

      <div style={codeBlockStyle}>
        <h3 style={codeHeading}>Webhook Handler</h3>
        <pre style={preStyle}>{`// api/src/functions/webhook.ts
import type { APIGatewayEvent } from "aws-lambda";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event: APIGatewayEvent) => {
  const payload = event.body;

  // IMPORTANT: Always verify webhook signatures!
  const verified = resend.webhooks.verify({
    payload,
    headers: {
      id: event.headers["svix-id"],
      timestamp: event.headers["svix-timestamp"],
      signature: event.headers["svix-signature"],
    },
    webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
  });

  if (verified.type === "email.received") {
    // Webhook contains metadata only, fetch the full email
    const { data: email } = await resend.emails.receiving.get(
      verified.data.email_id,
    );

    console.log("Received from:", verified.data.from);
    console.log("Subject:", email.subject);
    console.log("Body:", email.html || email.text);

    // Optional: Forward the email
    await resend.emails.send({
      from: "System <system@yourdomain.com>",
      to: ["team@yourdomain.com"],
      subject: \`Fwd: \${email.subject}\`,
      html: email.html,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};`}</pre>
      </div>

      <div style={codeBlockStyle}>
        <h3 style={codeHeading}>Handling Attachments</h3>
        <pre style={preStyle}>{`// Handling attachments from received emails
if (verified.type === "email.received") {
  const { data: attachments } =
    await resend.emails.receiving.attachments.list({
      emailId: verified.data.email_id,
    });

  // Download and forward attachments
  const forwardedAttachments = await Promise.all(
    attachments.map(async (att) => {
      // Download URLs expire after 1 hour
      const res = await fetch(att.download_url);
      const buffer = Buffer.from(await res.arrayBuffer());
      return {
        filename: att.filename,
        content: buffer.toString("base64"),
      };
    }),
  );

  await resend.emails.send({
    from: "System <system@yourdomain.com>",
    to: ["team@yourdomain.com"],
    subject: \`Fwd: \${email.subject}\`,
    html: email.html,
    attachments: forwardedAttachments,
  });
}`}</pre>
      </div>

      <div style={setupStyle}>
        <h3 style={sectionHeading}>Local Development with ngrok</h3>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
          Since webhooks need to reach your server, use ngrok to expose your local dev server:
        </p>
        <ol style={olStyle}>
          <li style={liStyle}>Install ngrok: <code style={inlineCodeStyle}>brew install ngrok</code></li>
          <li style={liStyle}>Start your dev server: <code style={inlineCodeStyle}>yarn rw dev</code></li>
          <li style={liStyle}>Expose it: <code style={inlineCodeStyle}>ngrok http 8910</code></li>
          <li style={liStyle}>Copy the HTTPS URL (e.g., <code style={inlineCodeStyle}>https://abc123.ngrok.io</code>)</li>
          <li style={liStyle}>Add it as your webhook URL: <code style={inlineCodeStyle}>https://abc123.ngrok.io/.redwood/functions/webhook</code></li>
        </ol>
      </div>
    </>
  );
};

const setupStyle: React.CSSProperties = {
  padding: "20px",
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  marginBottom: "24px",
};

const sectionHeading: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontSize: "16px",
  fontWeight: 600,
};

const olStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "20px",
  fontSize: "14px",
  lineHeight: "1.8",
};

const liStyle: React.CSSProperties = {
  marginBottom: "8px",
};

const stepDescription: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "14px",
  color: "#666",
};

const inlineCodeStyle: React.CSSProperties = {
  background: "#fff",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "13px",
};

const linkStyle: React.CSSProperties = {
  color: "#18181b",
  textDecoration: "underline",
};

const inlinePreStyle: React.CSSProperties = {
  marginTop: "8px",
  padding: "8px",
  background: "#fff",
  borderRadius: "4px",
  fontSize: "13px",
  display: "inline-block",
};

const warningStyle: React.CSSProperties = {
  padding: "16px 20px",
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "8px",
  marginBottom: "24px",
};

const codeBlockStyle: React.CSSProperties = {
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#e4e4e7",
};

const codeHeading: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontSize: "14px",
  color: "#e4e4e7",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  lineHeight: "1.6",
};

export default InboundPage;
