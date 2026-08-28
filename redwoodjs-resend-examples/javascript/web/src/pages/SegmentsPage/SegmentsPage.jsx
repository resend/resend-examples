import { useState, useEffect } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const buttonStyle = { padding: "10px 20px", backgroundColor: "#18181b", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const codeBlockStyle = { marginTop: "32px", padding: "20px", backgroundColor: "#18181b", borderRadius: "8px", color: "#e4e4e7" };
const preStyle = { margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", wordBreak: "break-all" };

const SegmentsPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/.redwood/functions/segmentsContacts");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <>
      <MetaTags title="Segments" description="Manage segments and contacts" />

      <PageHeader
        title="Segments"
        description="Manage segments and contacts using the Resend API."
      />

      <button onClick={fetchContacts} disabled={loading} style={buttonStyle}>
        {loading ? "Loading..." : "Refresh Contacts"}
      </button>

      <ResultDisplay loading={loading} data={result} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// List segments
const { data: segments } = await resend.segments.list();

// List contacts in a segment
const { data, error } = await resend.contacts.list({
  segmentId: "seg_xxxxxxxxx",
});

// Create a contact
const { data: contact } = await resend.contacts.create({
  email: "user@example.com",
  firstName: "John",
  segments: [{ id: "seg_xxxxxxxxx" }],
});`}</pre>
      </div>
    </>
  );
};

export default SegmentsPage;
