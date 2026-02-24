import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  // GET: list domains
  if (event.httpMethod === "GET") {
    const { data, error } = await resend.domains.list();

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, domains: data?.data || [] }),
    };
  }

  // POST: create domain
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    const { name, region } = body;

    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required field: name" }),
      };
    }

    const { data, error } = await resend.domains.create({
      name,
      region: region || "us-east-1",
    });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, domain: data }),
    };
  }

  return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
};
