import type { APIGatewayEvent, Context } from "aws-lambda";
import { resend } from "src/lib/resend";

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  // GET: list API keys
  if (event.httpMethod === "GET") {
    const { data, error } = await resend.apiKeys.list();

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, apiKeys: data?.data || [] }),
    };
  }

  // POST: create API key
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    const { name, permission } = body;

    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required field: name" }),
      };
    }

    const { data, error } = await resend.apiKeys.create({
      name,
      permission: permission || "full_access",
    });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, apiKey: data }),
    };
  }

  // PATCH: rename an API key
  if (event.httpMethod === "PATCH") {
    const body = JSON.parse(event.body || "{}");
    const { id, name } = body;

    if (!id || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: id, name" }),
      };
    }

    // Only `name` is patchable - never forward permission/domainId here,
    // so a leaked key can't be used to widen another key's scope.
    const { data, error } = await resend.apiKeys.update(id, { name });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, apiKey: data }),
    };
  }

  // DELETE: remove an API key
  if (event.httpMethod === "DELETE") {
    const body = JSON.parse(event.body || "{}");
    const { id } = body;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required field: id" }),
      };
    }

    const { data, error } = await resend.apiKeys.remove(id);

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, apiKey: data }),
    };
  }

  return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
};
