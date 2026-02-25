import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const { data, error } = await resend.domains.list();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};
