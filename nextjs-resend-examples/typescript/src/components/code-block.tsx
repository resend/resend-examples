/**
 * Code Block Component
 *
 * Displays code snippets with syntax highlighting appearance.
 * Used to show example code alongside working demos.
 */

interface CodeBlockProps {
  /** The code to display */
  code: string;
  /** Programming language for syntax highlighting hint */
  language?: string;
  /** Optional title above the code block */
  title?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  title,
}: CodeBlockProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-[var(--muted)] border-b border-[var(--border)]">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-[var(--muted-foreground)] ml-2">
            {language}
          </span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto bg-[var(--muted)] text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
