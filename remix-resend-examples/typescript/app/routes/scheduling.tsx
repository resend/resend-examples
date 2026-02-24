import { useFetcher } from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta: MetaFunction = () => {
  return [{ title: "Scheduled Send - Remix + Resend" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const minutes = formData.get("minutes") as string;

  if (!to || !subject || !message) {
    return json(
      { error: "Missing required fields: to, subject, message" },
      { status: 400 }
    );
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  // Schedule for N minutes in the future (maximum: 7 days)
  const delay = Math.min(Number(minutes) || 5, 10080);
  const scheduledAt = new Date(Date.now() + delay * 60 * 1000).toISOString();

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<h1>Hello from the future!</h1><p>${message}</p>`,
    scheduledAt,
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id, scheduledAt });
}

export default function Scheduling() {
  const fetcher = useFetcher<typeof action>();

  return (
    <div>
      <PageHeader
        title="Scheduled Send"
        description="Schedule an email for future delivery. Maximum scheduling window is 7 days."
      />

      <fetcher.Form method="post" style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="to" style={labelStyle}>
            To
          </label>
          <input
            id="to"
            name="to"
            type="email"
            placeholder="delivered@resend.dev"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="subject" style={labelStyle}>
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            defaultValue="Scheduled Email"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="message" style={labelStyle}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            defaultValue="This email was scheduled for later delivery."
            required
            rows={3}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="minutes" style={labelStyle}>
            Delay (minutes)
          </label>
          <input
            id="minutes"
            name="minutes"
            type="number"
            defaultValue="5"
            min="1"
            max="10080"
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Scheduling..." : "Schedule Email"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const scheduledAt = new Date(
  Date.now() + 5 * 60 * 1000
).toISOString();

const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Scheduled Email",
  html: "<h1>Hello from the future!</h1>",
  scheduledAt,
});

// To cancel: resend.emails.cancel(data.id)`}</pre>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "4px",
  fontSize: "14px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#18181b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};

const codeBlockStyle: React.CSSProperties = {
  marginTop: "32px",
  padding: "20px",
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#e4e4e7",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};
