import { Webhook } from "svix";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  const body = await readRawBody(event);

  const svixId = headers["svix-id"];
  const svixTimestamp = headers["svix-timestamp"];
  const svixSignature = headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing webhook headers",
    });
  }

  const webhookSecret = config.resendWebhookSecret;
  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Webhook secret not configured",
    });
  }

  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(body || "", {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const payload = JSON.parse(body || "{}");
    console.log("Received webhook event:", payload.type);

    switch (payload.type) {
      case "email.received":
        console.log("New email from:", payload.data?.from);
        break;
      case "email.delivered":
        console.log("Email delivered:", payload.data?.email_id);
        break;
      case "email.bounced":
        console.log("Email bounced:", payload.data?.email_id);
        break;
      case "email.clicked":
        console.log("Email clicked:", payload.data?.email_id);
        break;
    }

    return { received: true, type: payload.type };
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message,
    });
  }
});
