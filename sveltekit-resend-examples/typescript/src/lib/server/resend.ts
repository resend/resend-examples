import { Resend } from "resend";
import { RESEND_API_KEY } from "$env/static/private";

export const resend = new Resend(RESEND_API_KEY);
