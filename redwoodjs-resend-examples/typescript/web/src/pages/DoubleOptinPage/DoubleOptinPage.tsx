import { useState, FormEvent } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const DoubleOptinPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      email: formData.get("email"),
      name: formData.get("name"),
    };

    try {
      const res = await fetch("/.redwood/functions/doubleOptinSubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags title="Double Opt-in" description="Double opt-in subscription flow" />

      <PageHeader
        title="Double Opt-in"
        description="Implement a double opt-in subscription flow."
      />

      <div
        style={{
          padding: "16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          marginBottom: "24px",
          fontSize: "14px",
        }}
      >
        <strong>How it works:</strong>
        <ol style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
          <li>User submits their email (contact created as unsubscribed).</li>
          <li>A confirmation email is sent with a link.</li>
          <li>User clicks the link, triggering an <code>email.clicked</code> webhook.</li>
          <li>Webhook handler updates the contact to subscribed.</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" name="email" type="email" placeholder="user@example.com" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="name" style={labelStyle}>Name (optional)</label>
          <input id="name" name="name" placeholder="John Doe" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      <ResultDisplay loading={loading} data={result} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// Step 1: Create contact (pending)
const { data: contact } = await resend.contacts.create({
  audienceId: "aud_xxx",
  email: "user@example.com",
  unsubscribed: true,
});

// Step 2: Send confirmation email
await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["user@example.com"],
  subject: "Confirm your subscription",
  html: '<a href="https://example.com/confirmed">Confirm</a>',
});

// Step 3: On email.clicked webhook, confirm
await resend.contacts.update({
  audienceId: "aud_xxx",
  id: contact.id,
  unsubscribed: false,
});`}</pre>
      </div>
    </>
  );
};

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid #d4d4d8", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle: React.CSSProperties = { padding: "10px 20px", backgroundColor: "#18181b", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const codeBlockStyle: React.CSSProperties = { marginTop: "32px", padding: "20px", backgroundColor: "#18181b", borderRadius: "8px", color: "#e4e4e7" };
const preStyle: React.CSSProperties = { margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", wordBreak: "break-all" };

export default DoubleOptinPage;
