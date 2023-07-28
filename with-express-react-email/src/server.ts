import express, { Request, Response } from 'express';
import { WaitlistEmail } from '../transactional/emails/waitlist';
import { resend } from './lib/resend';

const app = express();

app.get('/send', async (req: Request, res: Response) => {
  try {
    const emailData = {
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Waitlist',
      react: WaitlistEmail({ name: 'Bu' }),
    };

    const data = await resend.emails.send(emailData);

    return res.status(200).json({ data: data.id });
  } catch (error) {
    return console.log(error);
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
