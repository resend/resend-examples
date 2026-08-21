import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const { data, error } = await resend.apiKeys.list();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};

export const POST: RequestHandler = async ({ request }) => {
  const { name, permission, domainId } = await request.json();

  const { data, error } = await resend.apiKeys.create({
    name,
    permission,
    domainId: domainId || undefined,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};

export const PATCH: RequestHandler = async ({ request }) => {
  const { id, name } = await request.json();

  // Only `name` is patchable — never forward permission/domainId here,
  // so a leaked key can't be used to widen another key's scope.
  const { data, error } = await resend.apiKeys.update(id, { name });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json();

  const { data, error } = await resend.apiKeys.remove(id);

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};
