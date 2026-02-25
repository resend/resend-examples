export function ResultDisplay({ state, data }) {
  if (state === "submitting" || state === "loading") {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f4f4f5",
          borderRadius: "8px",
          marginTop: "16px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!data) return null;

  const isError = data.error || data.success === false;

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: isError ? "#fef2f2" : "#f0fdf4",
        border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
        borderRadius: "8px",
        marginTop: "16px",
      }}
    >
      <strong style={{ color: isError ? "#dc2626" : "#16a34a" }}>
        {isError ? "Error" : "Success"}
      </strong>
      <pre
        style={{
          margin: "8px 0 0 0",
          fontSize: "13px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
