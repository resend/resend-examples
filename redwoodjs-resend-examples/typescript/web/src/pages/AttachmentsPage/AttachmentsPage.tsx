import { useState, FormEvent } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const AttachmentsPage = () => {
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
      filename: formData.get("filename"),
    };

    try {
      const res = await fetch("/.redwood/functions/sendAttachment", {
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
      <MetaTags title="Attachments" description="Send email with attachments" />

      <PageHeader
        title="Attachments"
        description="Send an email with a base64-encoded file attachment."
      />

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="to" style={labelStyle}>To</label>
          <input id="to" name="to" type="email" placeholder="delivered@resend.dev" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="subject" style={labelStyle}>Subject</label>
          <input id="subject" name="subject" placeholder="Email with attachment" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="message" style={labelStyle}>Message</label>
          <textarea id="message" name="message" placeholder="Check the attached file..." required rows={3} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="filename" style={labelStyle}>Filename (optional)</label>
          <input id="filename" name="filename" placeholder="sample.txt" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Sending..." : "Send with Attachment"}
        </button>
      </form>

      <ResultDisplay loading={loading} data={result} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Email with attachment",
  html: "<h1>Your attachment is ready</h1>",
  attachments: [
    {
      filename: "sample.txt",
      content: Buffer.from("Hello!").toString("base64"),
    },
  ],
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

export default AttachmentsPage;
