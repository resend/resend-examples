import { resend } from '../../../lib/resend';

export async function POST() {
  const response = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
    subject: 'Receipt for your payment',
    html: '<p>Thanks for the payment</p>',
    attachments: [
      {
        path: 'https://resend.com/static/sample/invoice.pdf',
        filename: 'sample-invoice.pdf',
      },
    ],
  });

  return Response.json(response, {
    status: response.error ? 500 : 200,
  });
}
