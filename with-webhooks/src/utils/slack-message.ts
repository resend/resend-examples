import { slack } from '../lib';
import { WebhookEvent } from '../types';

export const sendSlackMessage = (event: WebhookEvent) =>
  slack.send({
    channel: '#bot-email-events',
    text: 'Bounced email 📩',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Bounced email 📩',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Subject:*\n${event.data.subject}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*From:*\n${event.data.from}`,
          },
          {
            type: 'mrkdwn',
            text: `*To:*\n${event.data.to[0]}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: 'View email',
            },
            value: 'click_me_123',
          },
        ],
      },
    ],
  });
