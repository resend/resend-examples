import { Link } from "@remix-run/react";

export const meta = () => {
  return [{ title: "Remix + Resend Examples" }];
};

const examples = [
  {
    to: "/send-email",
    title: "Send Email",
    description: "Send a basic email with subject and HTML body.",
  },
  {
    to: "/attachments",
    title: "Attachments",
    description: "Send an email with a base64-encoded file attachment.",
  },
  {
    to: "/cid-attachments",
    title: "CID Attachments",
    description: "Send an email with an inline image using Content-ID.",
  },
  {
    to: "/scheduling",
    title: "Scheduled Send",
    description: "Schedule an email for future delivery (up to 7 days).",
  },
  {
    to: "/templates",
    title: "Templates",
    description: "Send an email using a Resend hosted template.",
  },
  {
    to: "/prevent-threading",
    title: "Prevent Threading",
    description:
      "Send emails with unique X-Entity-Ref-ID to prevent Gmail threading.",
  },
  {
    to: "/audiences",
    title: "Audiences",
    description: "Manage audiences and contacts.",
  },
  {
    to: "/domains",
    title: "Domains",
    description: "List and manage sending domains.",
  },
  {
    to: "/double-optin",
    title: "Double Opt-in",
    description: "Implement a double opt-in subscription flow.",
  },
  {
    to: "/inbound",
    title: "Inbound Email",
    description: "Learn how to receive and process inbound emails.",
  },
];

export default function Index() {
  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
        Remix + Resend Examples
      </h1>
      <p style={{ color: "#71717a", marginBottom: "32px", fontSize: "16px" }}>
        Full-stack examples of sending emails using Resend with Remix.
      </p>
      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}
      >
        {examples.map((example) => (
          <Link
            key={example.to}
            to={example.to}
            style={{
              display: "block",
              padding: "20px",
              backgroundColor: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
              {example.title}
            </h2>
            <p style={{ margin: 0, color: "#71717a", fontSize: "14px" }}>
              {example.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
