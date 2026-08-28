import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const segmentId = process.env.RESEND_SEGMENT_ID || "your-segment-id";

// 1. List segments
console.log("=== Listing Segments ===");
const { data: segments } = await resend.segments.list();
segments?.data.forEach((segment) => {
  console.log(`  - ${segment.name} (${segment.id})`);
});

// 2. Create a contact
console.log("\n=== Creating Contact ===");
const { data: contact, error: createError } = await resend.contacts.create({
  email: "clicked@resend.dev",
  firstName: "Jane",
  lastName: "Doe",
  unsubscribed: false,
  segments: [{ id: segmentId }],
});

if (createError) {
  console.error("Error creating contact:", createError);
  process.exit(1);
}
console.log("Contact created:", contact?.id);

// 3. List contacts
console.log("\n=== Listing Contacts ===");
const { data: contacts } = await resend.contacts.list({ segmentId });
contacts?.data.forEach((c) => {
  console.log(
    `  - ${c.first_name} ${c.last_name} <${c.email}> (unsubscribed: ${c.unsubscribed})`
  );
});

// 4. Update the contact
console.log("\n=== Updating Contact ===");
await resend.contacts.update({
  id: contact.id,
  firstName: "Janet",
  unsubscribed: false,
});
console.log("Contact updated: Jane -> Janet");

// 5. Remove the contact
console.log("\n=== Removing Contact ===");
await resend.contacts.remove({ id: contact.id });
console.log("Contact removed:", contact?.id);

console.log("\nDone! Full segment/contact lifecycle complete.");
