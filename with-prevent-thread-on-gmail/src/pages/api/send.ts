import type { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '../../lib/resend';
import { v4 as uuid } from 'uuid';

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const data = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: 'Waitlist',
        html: '<h1>Hi</h1>',
        headers: {
          'X-Entity-Ref-ID': uuid(),
        },
      });

      return res.status(200).send({ data: data.id });
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default send;
