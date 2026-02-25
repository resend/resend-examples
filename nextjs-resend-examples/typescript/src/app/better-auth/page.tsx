/**
 * Better Auth + Resend Integration Example
 *
 * Demonstrates integrating better-auth with Resend for:
 * - Email verification
 * - Password reset emails
 * - Magic link authentication
 *
 * Key concepts:
 * - better-auth provides authentication framework
 * - Resend sends transactional emails (verification, reset)
 * - React Email templates for beautiful emails
 *
 * @see https://www.better-auth.com
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function BetterAuthPage() {
  const authConfigCode = `// lib/auth.ts
import { betterAuth } from 'better-auth';
import { resend } from './resend';
import { VerificationEmail } from '@/emails/verification';
import { PasswordResetEmail } from '@/emails/password-reset';

export const auth = betterAuth({
  // Your database adapter (Prisma, Drizzle, etc.)
  database: {
    // Configure your database connection
  },

  // Email/password authentication with email verification
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    // Send password reset emails via Resend
    sendResetPassword: async ({ user, url, token }, request) => {
      // Don't await - prevents timing attacks
      void resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [user.email],
        subject: 'Reset your password',
        react: PasswordResetEmail({ resetUrl: url }),
      });
    },
  },

  // Email verification settings
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    // Send verification emails via Resend
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Don't await - prevents timing attacks
      void resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [user.email],
        subject: 'Verify your email address',
        react: VerificationEmail({ verificationUrl: url }),
      });
    },
  },
});`;

  const routeHandlerCode = `// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);`;

  const clientCode = `// components/auth-form.tsx
'use client';

import { authClient } from '@/lib/auth-client';

export function SignUpForm() {
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { data, error } = await authClient.signUp.email({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
    });

    if (error) {
      console.error('Sign up failed:', error);
      return;
    }

    // User created! Verification email sent automatically
    console.log('Check your email for verification link');
  };

  return (
    <form onSubmit={handleSignUp}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Better Auth + Resend"
        description="Authentication with email verification and password reset."
        sourcePath="src/app/better-auth/page.tsx"
      />

      {/* Setup notice */}
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Database Required</h3>
        <p className="text-sm text-yellow-700 mb-2">
          better-auth requires a database to store users and sessions. Configure
          your database connection in the auth config.
        </p>
        <p className="text-sm text-yellow-700">
          Supported databases: PostgreSQL, MySQL, SQLite (via Prisma, Drizzle,
          or raw SQL)
        </p>
      </div>

      {/* Installation */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Installation</h2>
        <pre className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm overflow-x-auto">
          pnpm add better-auth
        </pre>
      </div>

      {/* Auth config */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Auth Configuration</h2>
        <CodeBlock code={authConfigCode} title="lib/auth.ts" />
      </div>

      {/* Route handler */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">API Route Handler</h2>
        <CodeBlock
          code={routeHandlerCode}
          title="app/api/auth/[...all]/route.ts"
        />
      </div>

      {/* Client usage */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Client Usage</h2>
        <CodeBlock code={clientCode} title="components/auth-form.tsx" />
      </div>

      {/* Security notes */}
      <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Security Notes</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>Don&apos;t await email sends:</strong> Using{' '}
            <code className="bg-[var(--background)] px-1 rounded">void</code>
            prevents timing attacks that could reveal if an email exists
          </li>
          <li>
            <strong>Token expiration:</strong> Set appropriate expiration times
            for verification and reset links (default: 24h and 1h)
          </li>
          <li>
            <strong>Rate limiting:</strong> Implement rate limiting on auth
            endpoints to prevent abuse
          </li>
          <li>
            <strong>HTTPS only:</strong> Always use HTTPS in production to
            protect tokens in transit
          </li>
        </ul>
      </div>
    </main>
  );
}
