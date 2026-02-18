import { useFetcher } from "@remix-run/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta: MetaFunction = () => {
  return [{ title: "Send Email - Remix + Resend" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!to || !subject || !message) {
    return json(
      { error: "Missing required fields: to, subject, message" },
      { status: 400 }
    );
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id });
}

export default function SendEmail() {
  const fetcher = useFetcher<typeof action>();

  return (
    <div>
      <PageHeader
        title="Send Email"
        description="Send a basic email with subject and HTML body."
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
            placeholder="Hello from Remix"
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
            placeholder="Your email message..."
            required
            rows={4}
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Sending..." : "Send Email"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Hello from Remix",
  html: "<p>Your email message...</p>",
});`}</pre>
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
