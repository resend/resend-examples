import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RESEND_AUDIENCE_ID not configured" }),
    };
  }

  const { data, error } = await resend.contacts.list({ audienceId });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, contacts: data?.data || [] }),
  };
};
