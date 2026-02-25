/**
 * Result Display Component
 *
 * Shows the result of an API call or form submission.
 * Handles success, error, and loading states.
 */

interface ResultDisplayProps {
  /** Result data to display (will be JSON stringified) */
  data?: unknown;
  /** Error message if the operation failed */
  error?: string | null;
  /** Whether the operation is in progress */
  loading?: boolean;
  /** Title for the result section */
  title?: string;
}

export function ResultDisplay({
  data,
  error,
  loading,
  title = 'Result',
}: ResultDisplayProps) {
  if (loading) {
    return (
      <div className="mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
        <p className="text-[var(--muted-foreground)] animate-pulse">
          Sending...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50">
        <h3 className="font-medium text-red-800 mb-2">Error</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (data) {
    return (
      <div className="mt-6 p-4 rounded-lg border border-green-200 bg-green-50">
        <h3 className="font-medium text-green-800 mb-2">{title}</h3>
        <pre className="text-sm text-green-700 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return null;
}
