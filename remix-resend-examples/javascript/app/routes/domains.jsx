import { useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta = () => {
  return [{ title: "Domains - Remix + Resend" }];
};

export async function loader() {
  const { data, error } = await resend.domains.list();

  if (error) {
    return json({ domains: [], error: error.message });
  }

  return json({ domains: data?.data || [] });
}

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name");
    const region = formData.get("region");

    if (!name) {
      return json({ error: "Missing required field: name" }, { status: 400 });
    }

    const { data, error } = await resend.domains.create({
      name,
      region: region || "us-east-1",
    });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, domain: data });
  }

  if (intent === "verify") {
    const domainId = formData.get("domainId");

    if (!domainId) {
      return json({ error: "Missing required field: domainId" }, { status: 400 });
    }

    const { error } = await resend.domains.verify(domainId);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, message: "Domain verification initiated" });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
}

export default function Domains() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();

  return (
    <div>
      <PageHeader
        title="Domains"
        description="List and manage your sending domains."
      />

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Your Domains</h2>
        {loaderData.domains && loaderData.domains.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {loaderData.domains.map((domain) => (
              <li
                key={domain.id}
                style={{
                  padding: "12px",
                  backgroundColor: "#fff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{domain.name}</strong>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "12px",
                      color: domain.status === "verified" ? "#16a34a" : "#d97706",
                    }}
                  >
                    ({domain.status})
                  </span>
                </div>
                <fetcher.Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" name="intent" value="verify" />
                  <input type="hidden" name="domainId" value={domain.id} />
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
                    Verify
                  </button>
                </fetcher.Form>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#71717a" }}>No domains found.</p>
        )}
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Add Domain</h2>
      <fetcher.Form method="post" style={{ display: "grid", gap: "16px" }}>
        <input type="hidden" name="intent" value="create" />
        <div>
          <label htmlFor="name" style={labelStyle}>
            Domain Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="example.com"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="region" style={labelStyle}>
            Region
          </label>
          <select id="region" name="region" style={inputStyle}>
            <option value="us-east-1">US East (us-east-1)</option>
            <option value="eu-west-1">EU West (eu-west-1)</option>
            <option value="sa-east-1">South America (sa-east-1)</option>
          </select>
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Adding..." : "Add Domain"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// List domains
const { data: domains } = await resend.domains.list();

// Create a domain
const { data, error } = await resend.domains.create({
  name: "example.com",
  region: "us-east-1",
});

// Verify a domain
await resend.domains.verify(domainId);`}</pre>
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
