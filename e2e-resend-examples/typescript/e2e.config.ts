import { existsSync } from "node:fs";
import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";
import { chatgpt } from "e2e/oauth/chatgpt";

// The tests read RESEND_API_KEY and E2E_INBOX_ADDRESS to look up the codes
// the app sends; the runner loads no .env on its own.
if (existsSync(".env")) {
	process.loadEnvFile(".env");
}

const config: E2EConfig = {
	// Your ChatGPT subscription serves the model; sign in once with `e2e login openai`, `e2e models openai` lists the ids.
	agents: {
		default: {
			model: chatgpt("gpt-6-luna"),
			system: "You are a thorough QA agent. Verify every outcome.",
		},
	},
	// Each test waits for a real email to arrive.
	timeout: 180_000,
	targets: [
		{
			engine: web(),
			app: process.env.APP_URL
				? { url: process.env.APP_URL }
				: {
						url: "http://127.0.0.1:0",
						command: {
							executable: "npx",
							args: ["next", "dev", "--port", "{port}"],
							startupTimeout: 120_000,
							log: ".e2e/logs/app.log",
						},
					},
		},
	],
};

export default config;
