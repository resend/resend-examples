import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing api key id" });
  }

  const { data, error } = await resend.apiKeys.remove(id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, apiKey: data };
});
