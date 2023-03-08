import { Webhook } from "svix";

export const webhook = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
