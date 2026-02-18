import { useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta = () => {
  return [{ title: "Double Opt-in - Remix + Resend" }];
};

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const name = formData.get("name");

  if (!email) {
    return json({ error: "Missing required field: email" }, { status: 400 });
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return json({ error: "RESEND_AUDIENCE_ID not configured" }, { status: 500 });
  }

  const confirmUrl =
    process.env.CONFIRM_REDIRECT_URL || "https://example.com/confirmed";
  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const { data: contact, error: contactError } = await resend.contacts.create({
    audienceId,
    email,
    firstName: name || undefined,
    unsubscribed: true,
  });

  if (contactError) {
    return json({ error: contactError.message }, { status: 500 });
  }

  const greeting = name ? `Welcome, ${name}!` : "Welcome!";
  const html = `<div style="text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;">
  <h1>${greeting}</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href="${confirmUrl}" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
</div>`;

  const { data: sent, error: sendError } = await resend.emails.send({
    from,
    to: [email],
    subject: "Confirm your subscription",
    html,
  });

  if (sendError) {
    return json({ error: sendError.message }, { status: 500 });
  }

  return json({
    success: true,
    message: "Confirmation email sent",
    contact_id: contact?.id,
    email_id: sent?.id,
  });
}

export default function DoubleOptin() {
  const fetcher = useFetcher();

  return (
    <div>
      <PageHeader
        title="Double Opt-in"
        description="Implement a double opt-in subscription flow. The contact is created as unsubscribed, then confirmed via a webhook when they click the link."
      />

      <fetcher.Form method="post" style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="name" style={labelStyle}>
            Name (optional)
          </label>
          <input
            id="name"
            name="name"
            placeholder="Jane Doe"
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Subscribing..." : "Subscribe"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>How it works</h3>
        <pre style={preStyle}>{`// 1. Create contact as unsubscribed
const { data: contact } = await resend.contacts.create({
  audienceId,
  email,
  firstName: name,
  unsubscribed: true,
});

// 2. Send confirmation email with a link
await resend.emails.send({
  from,
  to: [email],
  subject: "Confirm your subscription",
  html: '<a href="...">Confirm Subscription</a>',
});

// 3. In webhook handler (email.clicked event):
await resend.contacts.update({
  audienceId,
  id: contact.id,
  unsubscribed: false,
});`}</pre>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "14px",
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#18181b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
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
