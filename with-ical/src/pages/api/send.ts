import type { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '../../lib/resend';
import ical, { ICalCalendarMethod } from 'ical-generator';

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'POST': {
      const calendar = ical({ name: 'my first iCal' });
      const startTime = new Date();
      const endTime = new Date();
      endTime.setHours(startTime.getHours() + 1);

      calendar.method(ICalCalendarMethod.REQUEST);

      calendar.createEvent({
        attendees: [
          { name: 'Attendee 1', email: 'vitor@example.com' },
          { name: 'Attendee 2', email: 'resend@example.com' },
        ],
        organizer: 'Acme <acme@example.com>',
        start: startTime,
        end: endTime,
        summary: 'Example Event',
        description: 'This is a test event',
        location: 'Location',
        url: 'http://meet.google.com/',
      });

      const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['delivered@resend.dev'],
        subject: '30 Minute Meeting',
        attachments: [
          {
            content: calendar.toString(),
            filename: 'invite.ics',
            // Ignoring until we release a new SDK version with the updated types
            // @ts-ignore
            contentType: 'text/calendar; charset="UTF-8"; method=REQUEST',
          },
        ],
        headers: {
          'Content-Disposition': 'attachment; filename="invite.ics"',
        },
        html: '<h1>Thanks for the invite</h1>',
      });

      if (error) {
        return res.status(500).send({ error });
      }

      return res.status(200).send({ data: data.id });
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default send;
