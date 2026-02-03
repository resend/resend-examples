/**
 * Resend Client Configuration
 *
 * This module initializes and exports the Resend client instance.
 * The client is used throughout the application to send emails.
 *
 * @see https://resend.com/docs/send-with-nodejs
 */

import { Resend } from 'resend';

// Validate that the API key is configured
if (!process.env.RESEND_API_KEY) {
  throw new Error(
    'Missing RESEND_API_KEY environment variable. ' +
      'Get your API key from https://resend.com/api-keys',
  );
}

/**
 * Singleton Resend client instance
 *
 * Usage:
 * ```ts
 * import { resend } from '@/lib/resend';
 *
 * const { data, error } = await resend.emails.send({
 *   from: 'you@example.com',
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   html: '<p>Hello World</p>'
 * });
 * ```
 */
export const resend = new Resend(process.env.RESEND_API_KEY);
