import { useState, FormEvent } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const SchedulingPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      to: formData.get("to"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      minutes: formData.get("minutes"),
    };

    try {
      const res = await fetch("/.redwood/functions/sendScheduled", {
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
      <MetaTags title="Scheduled Send" description="Schedule an email" />

      <PageHeader
        title="Scheduled Send"
        description="Schedule an email for future delivery (up to 7 days)."
      />

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="to" style={labelStyle}>To</label>
          <input id="to" name="to" type="email" placeholder="delivered@resend.dev" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="subject" style={labelStyle}>Subject</label>
          <input id="subject" name="subject" placeholder="Scheduled email" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="message" style={labelStyle}>Message</label>
          <textarea id="message" name="message" placeholder="This email was scheduled..." required rows={3} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="minutes" style={labelStyle}>Delay (minutes)</label>
          <input id="minutes" name="minutes" type="number" min="1" max="10080" defaultValue="5" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Scheduling..." : "Schedule Email"}
        </button>
      </form>

      <ResultDisplay loading={loading} data={result} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const scheduledAt = new Date(
  Date.now() + 5 * 60 * 1000
).toISOString();

const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Scheduled email",
  html: "<p>Hello from the future!</p>",
  scheduledAt,
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

export default SchedulingPage;
