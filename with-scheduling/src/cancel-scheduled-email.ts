import { resend } from "./lib/resend";

async function cancelScheduledEmail() {
  try {
    const data = await resend.emails.cancel(
      '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794'
    );

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

cancelScheduledEmail();