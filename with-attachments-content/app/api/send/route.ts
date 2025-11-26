import { resend } from '../../../lib/resend';

export async function POST(request: Request) {
  const { filename, content } = await request.json() as {
    filename: string;
    content: string;
  };

  const response = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
    subject: 'Receipt for your payment',
    html: '<p>Thanks for the payment</p>',
    attachments: [
      {
        filename,
        content,
      },
    ],
  });

  return Response.json(response, {
    status: response.error ? 500 : 200,
  });
}
