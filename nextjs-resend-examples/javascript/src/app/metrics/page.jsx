/**
 * Email Metrics Example
 *
 * Demonstrates retrieving account-level email metrics: delivery and
 * engagement totals, optionally broken down by period, domain, email,
 * or broadcast.
 *
 * Key concepts:
 * - With no `dimensions`, the response is a single `totals` row
 * - Add `dimensions` to break the response down (period/domain/email/broadcast)
 * - The `email` dimension/`emailId` filter and `broadcast` dimension/
 *   `broadcastId` filter are mutually exclusive
 * - `granularity` only matters when `period` is one of the dimensions
 *
 * @see https://resend.com/docs/api-reference/emails/get-metrics
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function MetricsPage() {
  const totalsCode = `import { resend } from '@/lib/resend';

// With no options, this returns totals for the last 6 days
const { data, error } = await resend.emails.metrics();

if (error) {
  throw new Error(error.message);
}

console.log('Sent:', data.totals.sent);
console.log('Delivered:', data.totals.delivered);
console.log('Bounced:', data.totals.bounced);`;

  const breakdownCode = `// Break totals down by day and by broadcast, for a specific broadcast
const { data } = await resend.emails.metrics({
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  dimensions: ['period', 'broadcast'],
  broadcastId: [broadcastId],
});

console.log('Totals for the range:', data.totals);

// One row per period/broadcast combination
for (const row of data.data ?? []) {
  console.log(row.period, row.broadcast_name, row.sent, row.delivered);
}`;

  const exclusivityCode = `// The "email" and "broadcast" dimensions (and their id filters)
// cannot be combined - this throws a TypeScript error at compile time:
await resend.emails.metrics({
  // @ts-expect-error - "email" and "broadcast" are mutually exclusive
  dimensions: ['email', 'broadcast'],
});

// Pick one or the other instead
await resend.emails.metrics({ dimensions: ['broadcast'] });
await resend.emails.metrics({ dimensions: ['email'] });`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Email Metrics"
        description="Retrieve account-level delivery and engagement metrics."
        sourcePath="src/app/metrics/page.jsx"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            1. Retrieve account-wide totals
          </h2>
          <CodeBlock code={totalsCode} title="Retrieving Metrics Totals" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            2. Break down by period and broadcast
          </h2>
          <CodeBlock
            code={breakdownCode}
            title="Retrieving a Metrics Breakdown"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            3. Email and broadcast are mutually exclusive
          </h2>
          <CodeBlock
            code={exclusivityCode}
            title="Dimension/Filter Exclusivity"
          />
        </div>
      </div>

      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Dimensions</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>period:</strong> Breaks results down by time bucket, sized
            by{' '}
            <code className="bg-[var(--border)] px-1 rounded">granularity</code>{' '}
            (hourly/daily/weekly/monthly)
          </li>
          <li>
            <strong>domain:</strong> Breaks results down by sending domain
          </li>
          <li>
            <strong>email:</strong> Breaks results down by individual email —
            cannot combine with{' '}
            <code className="bg-[var(--border)] px-1 rounded">broadcast</code>
          </li>
          <li>
            <strong>broadcast:</strong> Breaks results down by broadcast —
            cannot combine with{' '}
            <code className="bg-[var(--border)] px-1 rounded">email</code>
          </li>
        </ul>
      </div>
    </main>
  );
}
