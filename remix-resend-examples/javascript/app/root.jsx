import {
  Links,
  Meta,
  Outlet,
  ScrollRestoration,
  Link,
} from "@remix-run/react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/send-email", label: "Send Email" },
  { to: "/attachments", label: "Attachments" },
  { to: "/cid-attachments", label: "CID Attachments" },
  { to: "/scheduling", label: "Scheduling" },
  { to: "/templates", label: "Templates" },
  { to: "/prevent-threading", label: "Prevent Threading" },
  { to: "/audiences", label: "Audiences" },
  { to: "/domains", label: "Domains" },
  { to: "/double-optin", label: "Double Opt-in" },
  { to: "/inbound", label: "Inbound" },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          padding: 0,
          backgroundColor: "#fafafa",
          color: "#18181b",
        }}
      >
        <nav
          style={{
            backgroundColor: "#18181b",
            padding: "12px 24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
              marginRight: "8px",
            }}
          >
            Remix + Resend
          </span>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: "#a1a1aa",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
          <Outlet />
        </main>
        <ScrollRestoration />
      </body>
    </html>
  );
}
