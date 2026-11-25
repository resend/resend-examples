"use client";

import { useActionState } from "react";
import { type FormState, sendCode, verifyCode } from "./actions";

const initialState: FormState = {};

export function EmailForm({ notice }: { notice?: string | undefined }) {
	const [state, action, pending] = useActionState(sendCode, initialState);
	const error = state.error ?? notice;

	return (
		<form action={action} className="form">
			<label htmlFor="email" className="label">
				Email address
			</label>
			<input
				id="email"
				name="email"
				type="email"
				autoComplete="email"
				placeholder="you@example.com"
				required
				className="input"
			/>
			{error && (
				<p role="alert" className="error">
					{error}
				</p>
			)}
			<button type="submit" className="button" disabled={pending}>
				{pending ? "Sending…" : "Send code"}
			</button>
		</form>
	);
}

export function CodeForm() {
	const [state, action, pending] = useActionState(verifyCode, initialState);

	return (
		<form action={action} className="form">
			<label htmlFor="code" className="label">
				Verification code
			</label>
			<input
				id="code"
				name="code"
				type="text"
				inputMode="numeric"
				autoComplete="one-time-code"
				pattern="\d{6}"
				maxLength={6}
				placeholder="000000"
				required
				className="input code-input"
			/>
			{state.error && (
				<p role="alert" className="error">
					{state.error}
				</p>
			)}
			<button type="submit" className="button" disabled={pending}>
				{pending ? "Verifying…" : "Verify"}
			</button>
		</form>
	);
}
