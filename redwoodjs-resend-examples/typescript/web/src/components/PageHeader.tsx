import { Link } from "@redwoodjs/router";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <Link
        to="/"
        style={{
          color: "#71717a",
          textDecoration: "none",
          fontSize: "14px",
          display: "inline-block",
          marginBottom: "16px",
        }}
      >
        &larr; Back to examples
      </Link>
      <h1 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>{title}</h1>
      <p style={{ margin: 0, color: "#71717a", fontSize: "16px" }}>
        {description}
      </p>
    </div>
  );
}
