import { resend } from "./lib/resend";

async function scheduleEmail() {
  try {
    const oneMinuteFromNow = new Date(Date.now() + 1000 * 60).toISOString();

    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: 'Hello from the future',
      html: '<p>Happy sending</p>',
      scheduledAt: oneMinuteFromNow,
    });

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

scheduleEmail();
