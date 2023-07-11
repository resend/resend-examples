import SlackNotify from 'slack-notify';

export const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
