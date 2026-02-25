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
if (!import.meta.env.RESEND_API_KEY) {
  throw new Error(
    'Missing RESEND_API_KEY environment variable. ' +
      'Get your API key from https://resend.com/api-keys',
  );
}

/**
 * Singleton Resend client instance
 */
export const resend = new Resend(import.meta.env.RESEND_API_KEY);
