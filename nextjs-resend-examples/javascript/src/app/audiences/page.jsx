import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function AudiencesPage() {
  const code = `// List contacts
const { data } = await resend.contacts.list({ audienceId: 'aud_123' });

// Create contact
await resend.contacts.create({
  audienceId: 'aud_123',
  email: 'user@example.com',
  firstName: 'John',
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Audiences"
        description="Manage contacts and segments."
        sourcePath="src/app/audiences/page.jsx"
      />
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <p className="text-sm text-yellow-700">
          Create an audience in the Resend dashboard and add the ID to your .env
          file.
        </p>
      </div>
      <CodeBlock code={code} title="Contacts API" language="javascript" />
    </main>
  );
}
