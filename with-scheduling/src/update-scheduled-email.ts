import { resend } from "./lib/resend";

async function updateScheduledEmail() {
  try {
    const twoMinutesFromNow = new Date(Date.now() + 1000 * 120).toISOString();

    const data = await resend.emails.update({
      id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794',
      scheduledAt: twoMinutesFromNow,
    });

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

updateScheduledEmail();
