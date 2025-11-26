import express, { type Request, type Response } from 'express';
import { WaitlistEmail } from './emails/waitlist';
import { resend } from './lib/resend';

const app = express();

app.get('/send', async (_req: Request, res: Response) => {
  const response = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
    subject: 'Waitlist',
    react: <WaitlistEmail name="Bu" />,
  });

  return res.status(response.error ? 500 : 200).json(response);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
