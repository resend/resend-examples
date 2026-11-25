import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type VerificationSession = {
	pending?: {
		email: string;
		code: string;
		expiresAt: number;
		attempts: number;
	};
	verifiedEmail?: string;
	/** Why the last code stopped working, shown on the email form. */
	notice?: string;
};

const password = process.env.SESSION_SECRET;

if (!password || password.length < 32) {
	throw new Error("SESSION_SECRET must be set and at least 32 characters long");
}

const sessionOptions: SessionOptions = {
	password,
	cookieName: "email_verification",
	cookieOptions: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	},
};

export async function getSession() {
	return getIronSession<VerificationSession>(await cookies(), sessionOptions);
}
