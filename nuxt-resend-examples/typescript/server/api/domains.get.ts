import { Resend } from "resend";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);

  const { data, error } = await resend.domains.list();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { domains: data?.data || [] };
});
