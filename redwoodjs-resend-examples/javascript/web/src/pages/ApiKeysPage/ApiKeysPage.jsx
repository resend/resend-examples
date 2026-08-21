import { useState, useEffect } from "react";
import { MetaTags } from "@redwoodjs/web";
import { PageHeader } from "src/components/PageHeader";
import { ResultDisplay } from "src/components/ResultDisplay";

const labelStyle = { display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 500 };
const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #d4d4d8", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle = { padding: "10px 20px", backgroundColor: "#18181b", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer" };
const dangerButtonStyle = { ...buttonStyle, backgroundColor: "#dc2626" };
const codeBlockStyle = { marginTop: "32px", padding: "20px", backgroundColor: "#18181b", borderRadius: "8px", color: "#e4e4e7" };
const preStyle = { margin: 0, fontSize: "13px", whiteSpace: "pre-wrap", wordBreak: "break-all" };

const ApiKeysPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [renameResult, setRenameResult] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);

  const fetchApiKeys = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/.redwood/functions/apiKeys");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateResult(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      permission: formData.get("permission"),
    };

    try {
      const res = await fetch("/.redwood/functions/apiKeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setCreateResult(data);
      if (data.success) fetchApiKeys();
    } catch (err) {
      setCreateResult({ error: err.message });
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    setRenameResult(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      id: formData.get("id"),
      name: formData.get("name"),
    };

    try {
      const res = await fetch("/.redwood/functions/apiKeys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setRenameResult(data);
      if (data.success) fetchApiKeys();
    } catch (err) {
      setRenameResult({ error: err.message });
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleteResult(null);

    const formData = new FormData(e.currentTarget);
    const body = { id: formData.get("id") };

    try {
      const res = await fetch("/.redwood/functions/apiKeys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setDeleteResult(data);
      if (data.success) fetchApiKeys();
    } catch (err) {
      setDeleteResult({ error: err.message });
    }
  };

  return (
    <>
      <MetaTags title="API Keys" description="Manage API keys" />

      <PageHeader
        title="API Keys"
        description="List, create, rename, and delete API keys."
      />

      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Your API Keys</h3>
      <button onClick={fetchApiKeys} disabled={loading} style={buttonStyle}>
        {loading ? "Loading..." : "Refresh API Keys"}
      </button>
      <ResultDisplay loading={loading} data={result} />

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e4e4e7" }} />

      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Create API Key</h3>
      <p style={{ margin: "0 0 12px 0", color: "#71717a", fontSize: "14px" }}>
        The key&apos;s token is only returned once, at creation time.
      </p>
      <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Name</label>
          <input id="name" name="name" placeholder="Production Sending Key" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="permission" style={labelStyle}>Permission</label>
          <select id="permission" name="permission" style={inputStyle}>
            <option value="full_access">full_access</option>
            <option value="sending_access">sending_access</option>
          </select>
        </div>
        <button type="submit" style={buttonStyle}>Create API Key</button>
      </form>
      <ResultDisplay loading={false} data={createResult} />

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e4e4e7" }} />

      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Rename API Key</h3>
      <p style={{ margin: "0 0 12px 0", color: "#71717a", fontSize: "14px" }}>
        Only the name can be changed. Permission and domain are fixed at creation.
      </p>
      <form onSubmit={handleRename} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="rename-id" style={labelStyle}>API Key ID</label>
          <input id="rename-id" name="id" placeholder="1234abcd-..." required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="rename-name" style={labelStyle}>New Name</label>
          <input id="rename-name" name="name" placeholder="Production Sending Key (renamed)" required style={inputStyle} />
        </div>
        <button type="submit" style={buttonStyle}>Rename API Key</button>
      </form>
      <ResultDisplay loading={false} data={renameResult} />

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e4e4e7" }} />

      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Delete API Key</h3>
      <form onSubmit={handleDelete} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label htmlFor="delete-id" style={labelStyle}>API Key ID</label>
          <input id="delete-id" name="id" placeholder="1234abcd-..." required style={inputStyle} />
        </div>
        <button type="submit" style={dangerButtonStyle}>Delete API Key</button>
      </form>
      <ResultDisplay loading={false} data={deleteResult} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// List API keys
const { data } = await resend.apiKeys.list();

// Create an API key (token is only returned here, at creation)
const { data: created } = await resend.apiKeys.create({
  name: "Production Sending Key",
  permission: "sending_access",
});

// Rename an API key - only \`name\` is patchable
const { data: updated } = await resend.apiKeys.update(id, {
  name: "New Name",
});

// Delete an API key
await resend.apiKeys.remove(id);`}</pre>
      </div>
    </>
  );
};

export default ApiKeysPage;
