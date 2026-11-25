import { beforeEach, describe } from "@e2e-dev/web";
import { expect } from "e2e";
import { inboxTest as test } from "./support/inbox";

/** A 6 digit code guaranteed to differ from the real one. */
function wrongCode(code: string) {
	return ((Number(code) + 1) % 1_000_000).toString().padStart(6, "0");
}

describe("email verification", { tags: ["verification"] }, () => {
	beforeEach(async ({ app }) => {
		await app.open("/");
	});

	test("sends a code to the entered email address", async ({
		screen,
		inbox,
	}) => {
		await screen.getByLabel("Email address").fill(inbox.address);
		await screen.getByRole("button", "Send code").tap();
		await screen.getByRole("heading", "Check your inbox").waitFor();

		await inbox.waitForEmail();

		expect(await inbox.readCode()).toMatch(/^\d{6}$/);
		await expect(screen.getByRole("main")).toContainText(inbox.address);
	});

	test("verifies the email with the code from the inbox", async ({
		screen,
		inbox,
	}) => {
		await screen.getByLabel("Email address").fill(inbox.address);
		await screen.getByRole("button", "Send code").tap();
		await screen.getByRole("heading", "Check your inbox").waitFor();
		await inbox.waitForEmail();
		const code = await inbox.readCode();

		await screen.getByLabel("Verification code").fill(code);
		await screen.getByRole("button", "Verify").tap();
		await screen.getByRole("heading", "Email verified").waitFor();

		await expect(screen.getByRole("main")).toContainText(
			`${inbox.address} has been verified.`,
		);
	});

	test("rejects an incorrect code", async ({ screen, inbox }) => {
		await screen.getByLabel("Email address").fill(inbox.address);
		await screen.getByRole("button", "Send code").tap();
		await screen.getByRole("heading", "Check your inbox").waitFor();
		await inbox.waitForEmail();
		const code = await inbox.readCode();

		await screen.getByLabel("Verification code").fill(wrongCode(code));
		await screen.getByRole("button", "Verify").tap();

		await expect(screen.getByRole("alert")).toHaveText(
			"That code is incorrect. 4 attempts left.",
		);
		await expect(screen.getByRole("heading", "Check your inbox")).toBeVisible();
	});

	test("asks for a new code after five incorrect attempts", async ({
		screen,
		inbox,
	}) => {
		await screen.getByLabel("Email address").fill(inbox.address);
		await screen.getByRole("button", "Send code").tap();
		await screen.getByRole("heading", "Check your inbox").waitFor();
		await inbox.waitForEmail();
		const code = await inbox.readCode();
		for (let left = 4; left >= 1; left--) {
			await screen.getByLabel("Verification code").fill(wrongCode(code));
			await screen.getByRole("button", "Verify").tap();
			await screen
				.getByText(
					`That code is incorrect. ${left} attempt${left === 1 ? "" : "s"} left.`,
				)
				.waitFor();
		}

		await screen.getByLabel("Verification code").fill(wrongCode(code));
		await screen.getByRole("button", "Verify").tap();

		await expect(
			screen.getByRole("heading", "Verify your email"),
		).toBeVisible();
		await expect(screen.getByRole("alert")).toHaveText(
			"Too many incorrect attempts. Request a new code.",
		);
	});

	test("returns to the email form to use a different address", async ({
		screen,
		inbox,
	}) => {
		await screen.getByLabel("Email address").fill(inbox.address);
		await screen.getByRole("button", "Send code").tap();
		await screen.getByRole("heading", "Check your inbox").waitFor();

		await screen.getByRole("button", "Use a different email").tap();

		await expect(
			screen.getByRole("heading", "Verify your email"),
		).toBeVisible();
		await expect(screen.getByLabel("Email address")).toHaveValue("");
	});
});
