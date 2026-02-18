import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { name, region } = body;

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required field: name",
    });
  }

  const { data, error } = await resend.domains.create({
    name,
    region: region || "us-east-1",
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, domain: data };
});
