import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";

export async function GET() {
  const { data, error } = await resend.domains.list();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
