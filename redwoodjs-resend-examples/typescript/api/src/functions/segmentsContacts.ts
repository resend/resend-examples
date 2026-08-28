import type { APIGatewayEvent, Context } from "aws-lambda";
import { resend } from "src/lib/resend";

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const segmentId = process.env.RESEND_SEGMENT_ID;

  if (!segmentId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RESEND_SEGMENT_ID not configured" }),
    };
  }

  const { data, error } = await resend.contacts.list({ segmentId });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, contacts: data?.data || [] }),
  };
};
