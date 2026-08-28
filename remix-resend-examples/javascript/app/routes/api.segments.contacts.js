import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function loader() {
  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!segmentId) {
    return json(
      { error: "RESEND_SEGMENT_ID not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await resend.contacts.list({ segmentId });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, contacts: data?.data || [] });
}
