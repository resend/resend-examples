/**
 * Automations Example
 *
 * Demonstrates the full lifecycle of a Resend automation: an event-driven
 * workflow that sends emails when something happens in your product.
 *
 * Key concepts:
 * - An automation is a graph of steps joined by connections
 * - A trigger step starts the automation when an event is received
 * - Create automations as 'disabled', then enable them when ready
 * - Every trigger event produces a run you can inspect
 *
 * @see https://resend.com/docs/api-reference/automations
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function AutomationsPage() {
  const createCode = `import { resend } from '@/lib/resend';

// Template the send_email step will use (create one at resend.com/templates)
const templateId = process.env.RESEND_TEMPLATE_ID ?? 'your-template-id';

// Create it as 'disabled' so it never fires while you are still building
const { data: created, error } = await resend.automations.create({
  name: 'Welcome series',
  status: 'disabled',
  steps: [
    // A trigger step starts the automation when the event arrives
    { key: 'start', type: 'trigger', config: { eventName: 'user.created' } },
    // A send_email step delivers a published Resend template
    {
      key: 'welcome',
      type: 'send_email',
      config: { template: { id: templateId } },
    },
  ],
  // Connections wire the steps together, in order
  connections: [{ from: 'start', to: 'welcome' }],
});

if (error) {
  throw new Error(error.message);
}

const automationId = created.id;
console.log('Created automation:', automationId);`;

  const updateCode = `// The id is positional, then the fields you want to change
const { data: updated } = await resend.automations.update(automationId, {
  status: 'enabled',
});

console.log('Enabled automation:', updated.id);`;

  const getCode = `const { data: automation } = await resend.automations.get(automationId);

console.log('Name:', automation.name);
console.log('Status:', automation.status);

// Steps come back with their key, type, and resolved config
for (const step of automation.steps) {
  console.log('Step:', step.key, step.type);
}

// Connections describe the edges between those steps
for (const connection of automation.connections) {
  console.log('Connection:', connection.from, '->', connection.to);
}`;

  const listCode = `// List every automation in the project
const { data: all } = await resend.automations.list();

console.log('Total automations:', all.data.length);
console.log('More pages available:', all.has_more);

// Or narrow the list down to a single status
const { data: enabled } = await resend.automations.list({
  status: 'enabled',
  limit: 10,
});

console.log('Enabled automations:', enabled.data.length);`;

  const runsCode = `// Each time the trigger event fires, the automation records a run
const { data: runs } = await resend.automations.runs.list({ automationId });

console.log('Total runs:', runs.data.length);

// A freshly created automation has no runs yet, so always guard this
if (runs.data.length > 0) {
  // Only the single-run response carries per-step statuses
  const { data: run } = await resend.automations.runs.get({
    automationId,
    runId: runs.data[0].id,
  });

  console.log('Run status:', run.status);

  for (const step of run.steps) {
    console.log('Step:', step.key, step.type, step.status);
  }
}`;

  const cleanupCode = `// Stopping an automation disables it and halts its in-flight runs
const { data: stopped } = await resend.automations.stop(automationId);

console.log('Stopped:', stopped.id, 'status:', stopped.status);

// Deleting removes the automation and its configuration for good
const { data: deleted } = await resend.automations.remove(automationId);

console.log('Deleted:', deleted.id, 'deleted:', deleted.deleted);`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Automations"
        description="Build event-driven email workflows and inspect their runs."
        sourcePath="src/app/automations/page.tsx"
      />

      {/* Setup notice */}
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <p className="text-sm text-yellow-700">
          Publish a template in the{' '}
          <a
            href="https://resend.com/templates"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Resend dashboard
          </a>{' '}
          first, then add its id to your environment as{' '}
          <code className="bg-yellow-100 px-1 rounded">RESEND_TEMPLATE_ID</code>
          . The snippets below are not executed on this page &mdash; they create
          and delete a real automation.
        </p>
      </div>

      {/* Lifecycle */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            1. Create the automation
          </h2>
          <CodeBlock code={createCode} title="Creating an Automation" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">2. Enable it</h2>
          <CodeBlock code={updateCode} title="Updating an Automation" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            3. Read back steps and connections
          </h2>
          <CodeBlock code={getCode} title="Retrieving an Automation" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">4. List automations</h2>
          <CodeBlock code={listCode} title="Listing Automations" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">5. Inspect runs</h2>
          <CodeBlock code={runsCode} title="Working with Automation Runs" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">6. Stop and delete</h2>
          <CodeBlock code={cleanupCode} title="Stopping and Deleting" />
        </div>
      </div>

      {/* Step types */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Step Types</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>trigger:</strong> Starts the automation when the named event
            is received
          </li>
          <li>
            <strong>send_email:</strong> Sends a published template, with
            optional variables
          </li>
          <li>
            <strong>delay:</strong> Waits for a duration before continuing
          </li>
          <li>
            <strong>wait_for_event:</strong> Pauses until another event arrives,
            or times out
          </li>
          <li>
            <strong>condition:</strong> Branches on contact fields and custom
            properties
          </li>
          <li>
            <strong>add_to_segment, contact_update, contact_delete:</strong>
            Manage the contact as the automation runs
          </li>
        </ul>
      </div>
    </main>
  );
}
