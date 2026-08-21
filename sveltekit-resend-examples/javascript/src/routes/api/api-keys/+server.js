import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";

export async function GET() {
  const { data, error } = await resend.apiKeys.list();

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}

export async function POST({ request }) {
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
}

export async function PATCH({ request }) {
  const { id, name } = await request.json();

  // Only `name` is patchable — never forward permission/domainId here,
  // so a leaked key can't be used to widen another key's scope.
  const { data, error } = await resend.apiKeys.update(id, { name });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}

export async function DELETE({ request }) {
  const { id } = await request.json();

  const { data, error } = await resend.apiKeys.remove(id);

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
