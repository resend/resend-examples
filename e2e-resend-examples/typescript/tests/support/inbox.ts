import { randomUUID } from "node:crypto";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";
import { Resend } from "resend";

const CODE_PATTERN = /\b(\d{6})\b/;

function requireEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} must be set to run the e2e tests`);
	}
	return value;
}

/**
 * A unique address on a Resend receiving domain, so each test reads only its
 * own mail. E2E_INBOX_ADDRESS (e.g. tests@your-domain.com) gives the local
 * part and domain; a run-unique tag is added as `local+tag@domain`.
 */
function uniqueAddress() {
	const [local, domain] = requireEnv("E2E_INBOX_ADDRESS")
		.toLowerCase()
		.split("@");
	if (!local || !domain) {
		throw new Error("E2E_INBOX_ADDRESS must be a full email address");
	}
	return `${local}+${randomUUID().slice(0, 8)}@${domain}`;
}

export type Inbox = {
	/** The address to type into the app. */
	address: string;
	/** Waits until an email to `address` has been received. */
	waitForEmail: () => Promise<void>;
	/** Reads the 6 digit code from the email received at `address`. */
	readCode: () => Promise<string>;
};

async function findReceivedEmailId(resend: Resend, address: string) {
	const { data, error } = await resend.emails.receiving.list({
		to: [address],
		limit: 1,
	});
	if (error) {
		throw new Error(`Listing received emails failed: ${error.message}`);
	}

	return data.data[0]?.id;
}

export const inboxTest = test.extend<{ inbox: Inbox }>({
	// biome-ignore lint/correctness/noEmptyPattern: e2e fixtures must destructure their first parameter.
	inbox: async ({}, use) => {
		const resend = new Resend(requireEnv("RESEND_API_KEY"));
		const address = uniqueAddress();

		await use({
			address,
			waitForEmail: async () => {
				await expect
					.poll(() => findReceivedEmailId(resend, address), {
						timeout: 60_000,
						interval: 2_000,
						message: `No email arrived at ${address}`,
					})
					.toBeDefined();
			},
			readCode: async () => {
				const id = await findReceivedEmailId(resend, address);
				if (!id) {
					throw new Error(`No email has been received at ${address}`);
				}

				const { data: email, error } = await resend.emails.receiving.get(id);
				if (error) {
					throw new Error(`Fetching received email failed: ${error.message}`);
				}

				const code = (email.text ?? email.subject).match(CODE_PATTERN)?.[1];
				if (!code) {
					throw new Error(`The email to ${address} holds no 6 digit code`);
				}
				return code;
			},
		});
	},
});
