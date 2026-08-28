import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const query = getQuery(event);

  const segmentId =
    (query.segmentId as string) || config.resendSegmentId;

  if (!segmentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing segmentId parameter or RESEND_SEGMENT_ID config",
    });
  }

  const { data, error } = await resend.contacts.list({ segmentId });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { contacts: data?.data || [] };
});
