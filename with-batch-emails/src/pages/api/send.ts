import type { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '../../lib/resend';

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const data = await resend.batch.send([
        {
          from: 'Acme <onboarding@resend.dev>',
          to: ['delivered@resend.dev'],
          subject: 'Receipt for your payment',
          html: '<p>Thanks for the payment</p>'
        }
      ]);

      return res.status(200).send(data);
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default send;
