import { SendVerificationRequestParams } from 'next-auth/providers';
import { resend } from '../lib';

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams,
) => {
  try {
    await resend.emails.send({
      from: 'YOUR EMAIL FROM (eg: team@resend.com)',
      to: params.identifier,
      subject: 'YOUR EMAIL SUBJECT',
      html: 'YOUR EMAIL CONTENT',
    });
  } catch (error) {
    console.log({ error });
  }
};
