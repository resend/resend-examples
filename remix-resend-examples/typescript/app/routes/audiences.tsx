import { useFetcher } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Resend } from "resend";
import { PageHeader } from "~/components/PageHeader";
import { ResultDisplay } from "~/components/ResultDisplay";

const resend = new Resend(process.env.RESEND_API_KEY);

export const meta: MetaFunction = () => {
  return [{ title: "Audiences - Remix + Resend" }];
};

export async function loader(_args: LoaderFunctionArgs) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    return json({ contacts: [], error: "RESEND_AUDIENCE_ID not configured" });
  }

  const { data: audiences } = await resend.audiences.list();
  const { data: contacts } = await resend.contacts.list({ audienceId });

  return json({
    audiences: audiences?.data || [],
    contacts: contacts?.data || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return json({ error: "RESEND_AUDIENCE_ID not configured" }, { status: 500 });
  }

  if (intent === "create") {
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!email) {
      return json({ error: "Missing required field: email" }, { status: 400 });
    }

    const { data, error } = await resend.contacts.create({
      audienceId,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      unsubscribed: false,
    });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, contact: data });
  }

  if (intent === "remove") {
    const contactId = formData.get("contactId") as string;

    if (!contactId) {
      return json({ error: "Missing required field: contactId" }, { status: 400 });
    }

    const { error } = await resend.contacts.remove({
      audienceId,
      id: contactId,
    });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true, removed: contactId });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
}

export default function Audiences() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  return (
    <div>
      <PageHeader
        title="Audiences"
        description="Manage audiences and contacts. Set RESEND_AUDIENCE_ID in your .env file."
      />

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Contacts</h2>
        {loaderData.contacts && loaderData.contacts.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {loaderData.contacts.map((contact: any) => (
              <li
                key={contact.id}
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
                <span>
                  {contact.first_name} {contact.last_name} &lt;{contact.email}&gt;
                  {contact.unsubscribed && (
                    <span style={{ color: "#dc2626", marginLeft: "8px", fontSize: "12px" }}>
                      (unsubscribed)
                    </span>
                  )}
                </span>
                <fetcher.Form method="post" style={{ display: "inline" }}>
                  <input type="hidden" name="intent" value="remove" />
                  <input type="hidden" name="contactId" value={contact.id} />
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
                    Remove
                  </button>
                </fetcher.Form>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#71717a" }}>No contacts found.</p>
        )}
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Add Contact</h2>
      <fetcher.Form method="post" style={{ display: "grid", gap: "16px" }}>
        <input type="hidden" name="intent" value="create" />
        <div>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            style={inputStyle}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label htmlFor="firstName" style={labelStyle}>
              First Name
            </label>
            <input id="firstName" name="firstName" placeholder="Jane" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="lastName" style={labelStyle}>
              Last Name
            </label>
            <input id="lastName" name="lastName" placeholder="Doe" style={inputStyle} />
          </div>
        </div>
        <button type="submit" style={buttonStyle}>
          {fetcher.state === "submitting" ? "Adding..." : "Add Contact"}
        </button>
      </fetcher.Form>

      <ResultDisplay state={fetcher.state} data={fetcher.data} />

      <div style={codeBlockStyle}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>API Code</h3>
        <pre style={preStyle}>{`// Create a contact
const { data, error } = await resend.contacts.create({
  audienceId: "aud_...",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  unsubscribed: false,
});

// List contacts
const { data: contacts } = await resend.contacts.list({
  audienceId: "aud_...",
});

// Remove a contact
await resend.contacts.remove({
  audienceId: "aud_...",
  id: contact.id,
});`}</pre>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "4px",
  fontSize: "14px",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  backgroundColor: "#18181b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};

const codeBlockStyle: React.CSSProperties = {
  marginTop: "32px",
  padding: "20px",
  backgroundColor: "#18181b",
  borderRadius: "8px",
  color: "#e4e4e7",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};
