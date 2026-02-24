import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const audienceId = process.env.RESEND_AUDIENCE_ID || "your-audience-id";

// 1. List audiences
console.log("=== Listing Audiences ===");
const { data: audiences } = await resend.audiences.list();
audiences?.data.forEach((audience) => {
  console.log(`  - ${audience.name} (${audience.id})`);
});

// 2. Create a contact
console.log("\n=== Creating Contact ===");
const { data: contact, error: createError } = await resend.contacts.create({
  audienceId,
  email: "clicked@resend.dev",
  firstName: "Jane",
  lastName: "Doe",
  unsubscribed: false,
});

if (createError) {
  console.error("Error creating contact:", createError);
  process.exit(1);
}
console.log("Contact created:", contact?.id);

// 3. List contacts
console.log("\n=== Listing Contacts ===");
const { data: contacts } = await resend.contacts.list({ audienceId });
contacts?.data.forEach((c) => {
  console.log(
    `  - ${c.first_name} ${c.last_name} <${c.email}> (unsubscribed: ${c.unsubscribed})`
  );
});

// 4. Update the contact
console.log("\n=== Updating Contact ===");
await resend.contacts.update({
  audienceId,
  id: contact!.id,
  firstName: "Janet",
  unsubscribed: false,
});
console.log("Contact updated: Jane -> Janet");

// 5. Remove the contact
console.log("\n=== Removing Contact ===");
await resend.contacts.remove({ audienceId, id: contact!.id });
console.log("Contact removed:", contact?.id);

console.log("\nDone! Full audience/contact lifecycle complete.");
