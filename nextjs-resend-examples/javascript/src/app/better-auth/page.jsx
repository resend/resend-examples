import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function BetterAuthPage() {
  const code = `// lib/auth.js
import { betterAuth } from 'better-auth';
import { resend } from './resend';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [user.email],
        subject: 'Reset your password',
        html: \`<a href="\${url}">Reset password</a>\`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [user.email],
        subject: 'Verify your email',
        html: \`<a href="\${url}">Verify email</a>\`,
      });
    },
  },
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Better Auth + Resend"
        description="Authentication with email verification."
        sourcePath="src/app/better-auth/page.jsx"
      />
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Database Required</h3>
        <p className="text-sm text-yellow-700">
          better-auth requires a database. Configure your connection in the auth
          config.
        </p>
      </div>
      <CodeBlock code={code} title="lib/auth.js" language="javascript" />
    </main>
  );
}
