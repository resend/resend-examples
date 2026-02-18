export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    emailFrom: process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>",
    resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET || "",
    resendAudienceId: process.env.RESEND_AUDIENCE_ID || "",
    resendTemplateId: process.env.RESEND_TEMPLATE_ID || "",
    confirmRedirectUrl:
      process.env.CONFIRM_REDIRECT_URL || "https://example.com/confirmed",
  },
});
