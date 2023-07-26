import { Resend } from 'resend';

export const resend = new Resend(
  're_FzrbPgFo_MoiqEytvDKhBDQDqLFdycwBA' || process.env.RESEND_API_KEY!,
);
