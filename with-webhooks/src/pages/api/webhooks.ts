import type { NextApiRequest, NextApiResponse } from 'next';
import { WebhookRequiredHeaders } from 'svix';
import { buffer } from 'micro';
import { IncomingMessage } from 'http';
import { webhook } from '../../lib';
import { WebhookEvent } from '../../types';
import { sendSlackMessage } from '../../utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhooks = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'POST': {
      try {
        const payload = (await buffer(req)).toString();
        const headers = req.headers as IncomingMessage['headers'] &
          WebhookRequiredHeaders;

        const event = webhook.verify(payload, headers) as WebhookEvent;

        if (event.type === 'email.bounced') {
          sendSlackMessage(event);
        }

        return res.status(200).end();
      } catch (error) {
        return res.status(400).send(error);
      }
    }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default webhooks;
