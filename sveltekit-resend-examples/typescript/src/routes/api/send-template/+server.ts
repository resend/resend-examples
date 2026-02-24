import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { EMAIL_FROM, RESEND_TEMPLATE_ID } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const templateId = body.templateId || RESEND_TEMPLATE_ID;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [body.to],
    subject: "Template Email",
    react: undefined,
    html: "",
    headers: {
      "X-Resend-Template-Id": templateId,
    },
    ...(body.data && Object.keys(body.data).length > 0
      ? { tags: [{ name: "data", value: JSON.stringify(body.data) }] }
      : {}),
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};
