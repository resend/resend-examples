import { useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta = () => {
  return [{ title: "Prevent Threading - Remix + Resend" }];
};

export async function action({ request }) {
  const formData = await request.formData();
  const to = formData.get("to");
  const subject = formData.get("subject");
  const message = formData.get("message");

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
    html: `<h1>${subject}</h1><p>${message}</p>`,
    headers: {
      "X-Entity-Ref-ID": crypto.randomUUID(),
    },
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id });
}

export default function PreventThreading() {
  const fetcher = useFetcher();

  return (
    <div>
      <PageHeader
        title="Prevent Threading"
        description="Send emails with a unique X-Entity-Ref-ID header so Gmail treats each as a separate conversation."
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
            defaultValue="Order Confirmation"
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
            defaultValue="This email will appear as a separate conversation in Gmail."
            required
            rows={3}
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Sending..." : "Send (No Threading)"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Order Confirmation",
  html: "<h1>Order Confirmation</h1><p>Details...</p>",
  headers: {
    "X-Entity-Ref-ID": crypto.randomUUID(),
  },
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
