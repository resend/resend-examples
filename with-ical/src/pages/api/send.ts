import type { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '../../lib/resend';

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'POST': {
      const data = await resend.sendEmail({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: '30 Minute Meeting',
        attachments: [
          {
            path: 'https://gist.githubusercontent.com/zenorocha/4317a548e4cca166d0f50d54733f3f03/raw/37edb0735ab07e663b794d348dd99d7e6c9575be/invite.ics',
            filename: 'invite.ics',
          },
        ],
        headers: {
          'Content-Disposition': 'attachment; filename="invite.ics"',
          'Content-Type': 'text/calendar',
        },
        html: '<h1>Thanks for the invite</h1>',
      });

      return res.status(200).send({ data: data.id });
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default send;
