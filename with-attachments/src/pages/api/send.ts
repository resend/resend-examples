import type { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '../../lib/resend';

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const data = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: ["delivered@resend.dev"],
        subject: 'Receipt for Your Payment',
        attachments: [
          {
            path: 'path/to/file/invoice.pdf',
            filename: 'invoice.pdf',
          },
        ],
        html: '<h1>Thanks for the payment</h1>',
        text: 'Thanks for the payment',
      });

      return res.status(200).send({ data: data.id });
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default send;
