import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const query = getQuery(event);

  const audienceId =
    (query.audienceId as string) || config.resendAudienceId;

  if (!audienceId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing audienceId parameter or RESEND_AUDIENCE_ID config",
    });
  }

  const { data, error } = await resend.contacts.list({ audienceId });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { contacts: data?.data || [] };
});
