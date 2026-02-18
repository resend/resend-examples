/**
 * Domains Management Example
 *
 * Demonstrates creating a domain and displaying the required
 * DNS records for verification.
 *
 * Key concepts:
 * - Domains must be verified before sending
 * - DNS records include SPF, DKIM, and DMARC
 * - Use subdomains to separate transactional from marketing
 *
 * @see https://resend.com/docs/dashboard/domains/introduction
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { DomainManager } from './domain-manager';

export default function DomainsPage() {
  const createDomainCode = `// Create a new domain
const { data: domain, error } = await resend.domains.create({
  name: 'notifications.example.com',
  // Optional: specify region
  region: 'us-east-1',
});

// The response includes DNS records to add:
console.log(domain.records);
// [
//   { type: 'MX', name: 'notifications', value: '...', priority: 10 },
//   { type: 'TXT', name: 'notifications', value: 'v=spf1 ...' },
//   { type: 'TXT', name: 'resend._domainkey.notifications', value: '...' },
// ]`;

  const verifyDomainCode = `// Check domain verification status
const { data: domain } = await resend.domains.get(domainId);

console.log(domain.status); // 'pending' | 'verified' | 'failed'

// List all domains
const { data: domains } = await resend.domains.list();

// Delete a domain
await resend.domains.remove(domainId);`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Domain Management"
        description="Create domains and view required DNS records for verification."
        sourcePath="src/app/domains/page.jsx"
      />

      {/* Domain creation form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Create a Domain</h2>
        <DomainManager />
      </div>

      {/* DNS Setup Guide */}
      <div className="mb-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">DNS Record Types</h3>
        <dl className="text-sm text-[var(--muted-foreground)] space-y-3">
          <div>
            <dt className="font-medium text-[var(--foreground)]">MX Record</dt>
            <dd>Required for receiving emails (inbound feature)</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--foreground)]">SPF (TXT)</dt>
            <dd>Authorizes Resend to send on your domain&apos;s behalf</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--foreground)]">DKIM (TXT)</dt>
            <dd>Cryptographic signature to prove email authenticity</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--foreground)]">
              DMARC (TXT)
            </dt>
            <dd>Policy for handling failed authentication (recommended)</dd>
          </div>
        </dl>
      </div>

      {/* Code examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Create Domain API</h2>
          <CodeBlock code={createDomainCode} title="Creating a Domain" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Manage Domains</h2>
          <CodeBlock code={verifyDomainCode} title="Domain Operations" />
        </div>
      </div>

      {/* Best practices */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Best Practices</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>Use subdomains:</strong> Separate transactional
            (notifications.example.com) from marketing (mail.example.com) to
            protect reputation
          </li>
          <li>
            <strong>Set up DMARC:</strong> Helps prevent spoofing and improves
            deliverability
          </li>
          <li>
            <strong>Verify both SPF and DKIM:</strong> Both are important for
            inbox placement
          </li>
          <li>
            <strong>DNS propagation:</strong> Records can take up to 48 hours to
            propagate
          </li>
        </ul>
      </div>
    </main>
  );
}
