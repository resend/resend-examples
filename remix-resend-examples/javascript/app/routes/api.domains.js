import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function loader() {
  const { data, error } = await resend.domains.list();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, domains: data?.data || [] });
}

export async function action({ request }) {
  const body = await request.json();
  const { name, region } = body;

  if (!name) {
    return json({ error: "Missing required field: name" }, { status: 400 });
  }

  const { data, error } = await resend.domains.create({
    name,
    region: region || "us-east-1",
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, domain: data });
}
