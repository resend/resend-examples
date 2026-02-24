import { Link } from "@redwoodjs/router";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#18181b",
      }}
    >
      <nav
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "32px",
          paddingBottom: "16px",
          borderBottom: "1px solid #e4e4e7",
          flexWrap: "wrap",
        }}
      >
        <Link to="/" style={navLinkStyle}>
          Home
        </Link>
        <Link to="/send-email" style={navLinkStyle}>
          Send
        </Link>
        <Link to="/attachments" style={navLinkStyle}>
          Attachments
        </Link>
        <Link to="/scheduling" style={navLinkStyle}>
          Scheduling
        </Link>
        <Link to="/templates" style={navLinkStyle}>
          Templates
        </Link>
        <Link to="/domains" style={navLinkStyle}>
          Domains
        </Link>
        <Link to="/audiences" style={navLinkStyle}>
          Audiences
        </Link>
      </nav>
      <main>{children}</main>
    </div>
  );
};

const navLinkStyle: React.CSSProperties = {
  color: "#71717a",
  textDecoration: "none",
  fontSize: "14px",
};

export default MainLayout;
