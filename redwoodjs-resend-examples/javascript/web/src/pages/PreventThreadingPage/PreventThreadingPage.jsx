import { useState } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const labelStyle = { display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 };
const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #d4d4d8", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle = { padding: "10px 20px", backgroundColor: "#18181b", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const codeBlockStyle = { marginTop: "32px", padding: "20px", backgroundColor: "#18181b", borderRadius: "8px", color: "#e4e4e7" };
const preStyle = { margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", wordBreak: "break-all" };

const PreventThreadingPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      to: formData.get("to"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/.redwood/functions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags title="Prevent Threading" description="Prevent email threading" />

      <PageHeader
        title="Prevent Threading"
        description="Send emails with unique headers to prevent Gmail from grouping them into threads."
      />

      <div
        style={{
          padding: "16px",
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "8px",
          marginBottom: "24px",
          fontSize: "14px",
        }}
      >
        <strong>How it works:</strong> Gmail groups emails into threads based on
        subject line and headers. To prevent this, you can add a unique{" "}
        <code>X-Entity-Ref-ID</code> header to each email. Resend handles this
        automatically when you send emails with unique subjects or you can add
        custom headers.
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="to" style={labelStyle}>To</label>
          <input id="to" name="to" type="email" placeholder="delivered@resend.dev" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="subject" style={labelStyle}>Subject</label>
          <input id="subject" name="subject" placeholder="Unique subject line" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="message" style={labelStyle}>Message</label>
          <textarea id="message" name="message" placeholder="This email won't be threaded..." required rows={3} style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Sending..." : "Send (No Threading)"}
        </button>
      </form>

      <ResultDisplay loading={loading} data={result} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Unique subject line",
  html: "<p>This email won't be threaded.</p>",
  headers: {
    "X-Entity-Ref-ID": crypto.randomUUID(),
  },
});`}</pre>
      </div>
    </>
  );
};

export default PreventThreadingPage;
