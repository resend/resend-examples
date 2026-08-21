import { Resend } from "resend";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);

  const { data, error } = await resend.apiKeys.list();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { apiKeys: data?.data || [] };
});
