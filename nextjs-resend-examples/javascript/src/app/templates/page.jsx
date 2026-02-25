'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';

export default function TemplatesPage() {
  const [templateId, setTemplateId] = useState('');

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Resend Templates"
        description="Use pre-built templates from your Resend dashboard."
        sourcePath="src/app/templates/page.jsx"
      />
      <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
          <li>Create a template in the Resend dashboard</li>
          <li>Publish the template</li>
          <li>Copy the template ID</li>
        </ol>
      </div>
      <form className="space-y-4">
        <div>
          <label
            htmlFor="templateId"
            className="block text-sm font-medium mb-1"
          >
            Template ID
          </label>
          <input
            id="templateId"
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] font-mono text-sm"
            placeholder="tmpl_abc123..."
          />
        </div>
      </form>
    </main>
  );
}
