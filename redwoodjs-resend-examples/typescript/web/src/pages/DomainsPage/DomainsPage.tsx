import { useState, useEffect, FormEvent } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const DomainsPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [createResult, setCreateResult] = useState<Record<string, unknown> | null>(null);

  const fetchDomains = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/.redwood/functions/domains");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateResult(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      region: formData.get("region"),
    };

    try {
      const res = await fetch("/.redwood/functions/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setCreateResult(data);
      if (data.success) fetchDomains();
    } catch (err) {
      setCreateResult({ error: (err as Error).message });
    }
  };

  return (
    <>
      <MetaTags title="Domains" description="Manage sending domains" />

      <PageHeader
        title="Domains"
        description="List and manage sending domains."
      />

      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Your Domains</h3>
      <button onClick={fetchDomains} disabled={loading} style={buttonStyle}>
        {loading ? "Loading..." : "Refresh Domains"}
      </button>
      <ResultDisplay loading={loading} data={result} />

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e4e4e7" }} />

      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Add Domain</h3>
      <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Domain Name</label>
          <input id="name" name="name" placeholder="example.com" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="region" style={labelStyle}>Region</label>
          <select id="region" name="region" style={inputStyle}>
            <option value="us-east-1">us-east-1</option>
            <option value="eu-west-1">eu-west-1</option>
            <option value="sa-east-1">sa-east-1</option>
          </select>
        </div>
        <button type="submit" style={buttonStyle}>Add Domain</button>
      </form>

      <ResultDisplay loading={false} data={createResult} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// List domains
const { data } = await resend.domains.list();

// Create domain
const { data: domain } = await resend.domains.create({
  name: "example.com",
  region: "us-east-1",
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

export default DomainsPage;
