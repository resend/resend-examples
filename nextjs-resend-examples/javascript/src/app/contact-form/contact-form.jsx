'use client';

/**
 * Contact Form Client Component
 */

import { useActionState } from 'react';
import { submitContactForm } from './actions';

const initialState = {
  success: false,
  error: null,
  ids: null,
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState,
  );

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
            placeholder="john@example.com"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            You&apos;ll receive a confirmation email at this address
          </p>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
            placeholder="How can we help you?"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {state.success && (
        <div className="mt-6 p-4 rounded-lg border border-green-200 bg-green-50">
          <h3 className="font-medium text-green-800 mb-2">Message Sent!</h3>
          <p className="text-sm text-green-700">
            Check your email for a confirmation. We&apos;ll get back to you
            soon.
          </p>
          {state.ids && (
            <p className="text-xs text-green-600 mt-2">
              Email IDs: {state.ids.map((e) => e.id).join(', ')}
            </p>
          )}
        </div>
      )}

      {state.error && (
        <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50">
          <h3 className="font-medium text-red-800 mb-2">Error</h3>
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}
    </div>
  );
}
