import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Create an API key
console.log("=== Creating API Key ===");
const { data: created, error: createError } = await resend.apiKeys.create({
  name: "Production Sending Key",
  permission: "sending_access",
});

if (createError) {
  console.error("Error creating API key:", createError);
  process.exit(1);
}
console.log("API key created:", created?.id);
console.log("Token (shown once, store it securely):", created?.token);

// 2. Rename the API key
// Only `name` is patchable - a leaked key must not be able to widen its own scope.
console.log("\n=== Renaming API Key ===");
const { error: updateError } = await resend.apiKeys.update(created.id, {
  name: "Production Sending Key v2",
});

if (updateError) {
  console.error("Error renaming API key:", updateError);
  process.exit(1);
}
console.log("API key renamed: Production Sending Key -> Production Sending Key v2");

// 3. List API keys
console.log("\n=== Listing API Keys ===");
const { data: keys } = await resend.apiKeys.list();
keys?.data.forEach((key) => {
  console.log(`  - ${key.name} (${key.id})`);
});

// 4. Delete the API key
console.log("\n=== Deleting API Key ===");
await resend.apiKeys.remove(created.id);
console.log("API key deleted:", created?.id);

console.log("\nDone! Full API key lifecycle complete.");
