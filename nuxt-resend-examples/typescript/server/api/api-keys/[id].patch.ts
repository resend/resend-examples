import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing api key id" });
  }

  if (!body?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required field: name",
    });
  }

  // Only `name` is patchable - never forward permission/domainId from the
  // request body, so a leaked key can't widen another key's scope.
  const { data, error } = await resend.apiKeys.update(id, { name: body.name });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, apiKey: data };
});
