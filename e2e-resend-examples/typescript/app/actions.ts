"use server";

import { randomInt, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import { getSession } from "@/lib/session";

const resend = new Resend(process.env.RESEND_API_KEY);

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormState = { error?: string };

function generateCode() {
	return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function sendCode(
	_prev: FormState,
	formData: FormData,
): Promise<FormState> {
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase();

	if (!EMAIL_PATTERN.test(email)) {
		return { error: "Enter a valid email address." };
	}

	const code = generateCode();

	const { error } = await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL ?? "",
		to: email,
		subject: `Your verification code is ${code}`,
		text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
		html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
  <h1 style="font-size:20px;font-weight:600;margin:0 0 16px">Verify your email</h1>
  <p style="font-size:14px;line-height:24px;margin:0 0 24px">Enter this code to verify your email address. It expires in 10 minutes.</p>
  <p style="font-family:ui-monospace,Menlo,monospace;font-size:32px;font-weight:600;letter-spacing:8px;background:#f4f4f5;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px">${code}</p>
  <p style="font-size:12px;color:#71717a;margin:0">If you didn't request this, you can ignore this email.</p>
</div>`,
	});

	if (error) {
		console.error("Failed to send verification email", error);
		return { error: "We couldn't send the email. Try again." };
	}

	const session = await getSession();
	session.pending = {
		email,
		code,
		expiresAt: Date.now() + CODE_TTL_MS,
		attempts: 0,
	};
	delete session.verifiedEmail;
	delete session.notice;
	await session.save();

	return {};
}

export async function verifyCode(
	_prev: FormState,
	formData: FormData,
): Promise<FormState> {
	const input = String(formData.get("code") ?? "").replace(/\s/g, "");
	const session = await getSession();
	const pending = session.pending;

	if (!pending) {
		return { error: "No code is pending. Request a new one." };
	}

	if (Date.now() > pending.expiresAt) {
		delete session.pending;
		session.notice = "That code has expired. Request a new one.";
		await session.save();
		return {};
	}

	if (!/^\d{6}$/.test(input)) {
		return { error: "Enter the 6 digit code from the email." };
	}

	const matches = timingSafeEqual(
		Buffer.from(input),
		Buffer.from(pending.code),
	);

	if (!matches) {
		pending.attempts += 1;
		if (pending.attempts >= MAX_ATTEMPTS) {
			delete session.pending;
			session.notice = "Too many incorrect attempts. Request a new code.";
			await session.save();
			return {};
		}
		session.pending = pending;
		await session.save();
		const left = MAX_ATTEMPTS - pending.attempts;
		return {
			error: `That code is incorrect. ${left} attempt${left === 1 ? "" : "s"} left.`,
		};
	}

	delete session.pending;
	session.verifiedEmail = pending.email;
	await session.save();

	return {};
}

export async function startOver() {
	const session = await getSession();
	session.destroy();
}
