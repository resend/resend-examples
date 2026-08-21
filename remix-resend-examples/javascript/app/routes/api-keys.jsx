import { useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta = () => {
  return [{ title: "API Keys - Remix + Resend" }];
};

export async function loader() {
  const { data, error } = await resend.apiKeys.list();

  if (error) {
    return json({ apiKeys: [], error: error.message });
  }

  return json({ apiKeys: data?.data || [] });
}

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name");
    const permission = formData.get("permission");

    if (!name) {
      return json({ error: "Missing required field: name" }, { status: 400 });
    }

    const { data, error } = await resend.apiKeys.create({
      name,
      permission: permission || undefined,
    });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, apiKey: data });
  }

  if (intent === "update") {
    const id = formData.get("id");
    const name = formData.get("name");

    if (!id || !name) {
      return json({ error: "Missing required field: id or name" }, { status: 400 });
    }

    // Only `name` is patchable here - never forward permission/domainId from
    // the form, so a leaked key can't be used to widen another key's scope.
    const { data, error } = await resend.apiKeys.update(id, { name });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, apiKey: data });
  }

  if (intent === "remove") {
    const id = formData.get("id");

    if (!id) {
      return json({ error: "Missing required field: id" }, { status: 400 });
    }

    const { error } = await resend.apiKeys.remove(id);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, removed: id });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
}

export default function ApiKeys() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();

  return (
    <div>
      <PageHeader
        title="API Keys"
        description="List and manage your API keys."
      />

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Your API Keys</h2>
        {loaderData.apiKeys && loaderData.apiKeys.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {loaderData.apiKeys.map((apiKey) => (
              <li
                key={apiKey.id}
                style={{
                  padding: "12px",
                  backgroundColor: "#fff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <fetcher.Form
                  method="post"
                  style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1 }}
                >
                  <input type="hidden" name="intent" value="update" />
                  <input type="hidden" name="id" value={apiKey.id} />
                  <input
                    name="name"
                    defaultValue={apiKey.name}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Rename
                  </button>
                </fetcher.Form>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="remove" />
                  <input type="hidden" name="id" value={apiKey.id} />
                  <button
                    type="submit"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Delete
                  </button>
                </fetcher.Form>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#71717a" }}>No API keys found.</p>
        )}
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Create API Key</h2>
      <fetcher.Form method="post" style={{ display: "grid", gap: "16px" }}>
        <input type="hidden" name="intent" value="create" />
        <div>
          <label htmlFor="name" style={labelStyle}>
            Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Production"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="permission" style={labelStyle}>
            Permission
          </label>
          <select id="permission" name="permission" style={inputStyle}>
            <option value="full_access">Full Access</option>
            <option value="sending_access">Sending Access</option>
          </select>
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Creating..." : "Create API Key"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// List API keys
const { data: apiKeys } = await resend.apiKeys.list();

// Create an API key
const { data, error } = await resend.apiKeys.create({
  name: "Production",
  permission: "full_access",
});
// data.id, data.token (token is only shown once)

// Rename an API key (only "name" is patchable)
await resend.apiKeys.update(apiKeyId, { name: "Production (renamed)" });

// Delete an API key
await resend.apiKeys.remove(apiKeyId);`}</pre>
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
