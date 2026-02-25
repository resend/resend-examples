'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';

export default function SchedulingPage() {
  const [scheduledAt, setScheduledAt] = useState(() => {
    const date = new Date(Date.now() + 5 * 60 * 1000);
    return date.toISOString().slice(0, 16);
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Scheduled Sending"
        description="Schedule emails to be sent at a specific time."
        sourcePath="src/app/scheduling/page.jsx"
      />
      <form className="space-y-4">
        <div>
          <label
            htmlFor="scheduledAt"
            className="block text-sm font-medium mb-1"
          >
            Send At
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Must be within the next 7 days
          </p>
        </div>
      </form>
      <div className="mt-6 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">Scheduling Notes</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
          <li>• Use ISO 8601 format</li>
          <li>• Maximum 7 days in the future</li>
          <li>• Cancel with: resend.emails.cancel(emailId)</li>
        </ul>
      </div>
    </main>
  );
}
