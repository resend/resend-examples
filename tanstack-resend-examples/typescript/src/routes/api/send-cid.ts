/**
 * Send Email with CID (Inline Image) Attachment
 *
 * POST /api/send-cid
 *
 * Demonstrates embedding images directly in email HTML
 * using Content-ID references. The image appears inline
 * in the email body rather than as a downloadable attachment.
 *
 * @see https://resend.com/docs/send-with-attachments#inline-attachments
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/send-cid')({
  POST: async ({ request }) => {
    try {
      const { to } = await request.json();

      if (!to) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: to' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // 1x1 pixel PNG placeholder for demonstration
      // Replace with your actual logo/image in production
      const placeholderImage =
        'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAB' +
        'QUlEQVR4nO3dMQ6CQBCG0cHE++9BPYPGQGFhYeH7mvJlk/kvzEJCCAAAAAAAAAAAAAAAAD4t' +
        'Wu/gSCml1D8+x97Fq7W+X7fRuweO5IYkNyS5IckNSW5IckOSG5LckOSGJDckuSHJDUluSHJD' +
        'khuS3JDkhiQ3JLkhyQ1JbkhyQ5Ibkv4PycwUj9b7OGPV+gBn9Nfxaq3vt++7Y+cz7H2Gs/hr' +
        'Q5Ibcrlsfa2zWq9Z7/c+5u5+hrNa31nvY+7+Z7ir9Z71Pubuf4a7Wm9c72Pu7mdYW+t97P3M' +
        'AAAAAAAAAAAAAOBz0noHR0opPfQex97FWLX2t+vWeveAM/pnQ5IbktyQ5IYkNyS5IckNSW5I' +
        'ckOSG5LckOSGJDckuSHJDUluSHJDkhuS3JDkhiQ3JLkhyQ1Jbkhyw6Ve/7p7b5zReg9ntN7H' +
        '2v3P8BfrPcANSe4XkJlFJMvIuF8AAAAASUVORK5CYII=';

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
        to: [to],
        subject: 'Email with Inline Image - Resend Example',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: #f5f5f5;">
              <img src="cid:logo" alt="Company Logo" width="100" height="100" style="display: block; margin: 0 auto;" />
            </div>
            <div style="padding: 20px;">
              <h1 style="color: #333;">Inline Image Example</h1>
              <p style="color: #666; line-height: 1.6;">
                The image above is embedded directly in this email using a
                <strong>Content-ID (CID)</strong> reference.
              </p>
              <h2 style="color: #333; margin-top: 20px;">When to use CID attachments:</h2>
              <ul style="color: #666; line-height: 1.8;">
                <li>Company logos that must always display</li>
                <li>Icons and small decorative images</li>
                <li>Images that shouldn't be blocked by email clients</li>
              </ul>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: 'logo.png',
            content: placeholderImage,
            contentId: 'logo',
          },
        ],
      });

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          id: data?.id,
          message: 'Email with inline image sent successfully',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
