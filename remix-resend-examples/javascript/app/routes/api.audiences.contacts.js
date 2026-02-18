import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function loader() {
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    return json(
      { error: "RESEND_AUDIENCE_ID not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await resend.contacts.list({ audienceId });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, contacts: data?.data || [] });
}
