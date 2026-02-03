/**
 * Page Header Component
 *
 * Consistent header for all example pages with title,
 * description, and optional link to source code.
 *
 * @param {{ title: string, description: string, sourcePath?: string }} props
 */

import Link from 'next/link';

export function PageHeader({ title, description, sourcePath }) {
  return (
    <div className="mb-8">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 inline-block"
      >
        &larr; Back to examples
      </Link>

      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-[var(--muted-foreground)]">{description}</p>

      {sourcePath && (
        <a
          href={`https://github.com/resend/resend-examples/blob/main/nextjs-resend-examples/javascript/${sourcePath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mt-2 inline-block"
        >
          View source &rarr;
        </a>
      )}
    </div>
  );
}
