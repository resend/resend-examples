import { useState } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const labelStyle = { display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 };
const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #d4d4d8", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle = { padding: "10px 20px", backgroundColor: "#18181b", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const codeBlockStyle = { marginTop: "32px", padding: "20px", backgroundColor: "#18181b", borderRadius: "8px", color: "#e4e4e7" };
const preStyle = { margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", wordBreak: "break-all" };

const CidAttachmentsPage = () => {
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
    };

    try {
      const res = await fetch("/.redwood/functions/sendCid", {
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
      <MetaTags title="CID Attachments" description="Send email with CID inline images" />

      <PageHeader
        title="CID Attachments"
        description="Send an email with an inline image using Content-ID (CID)."
      />

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="to" style={labelStyle}>To</label>
          <input id="to" name="to" type="email" placeholder="delivered@resend.dev" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="subject" style={labelStyle}>Subject (optional)</label>
          <input id="subject" name="subject" placeholder="Email with Inline Image" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Sending..." : "Send with CID Image"}
        </button>
      </form>

      <ResultDisplay loading={loading} data={result} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Email with Inline Image",
  html: '<img src="cid:logo" alt="Logo" />',
  attachments: [
    {
      filename: "logo.png",
      content: base64EncodedImage,
      contentId: "logo",
    },
  ],
});`}</pre>
      </div>
    </>
  );
};

export default CidAttachmentsPage;
