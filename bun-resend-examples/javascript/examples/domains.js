import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. List all domains
console.log("=== Listing Domains ===");
const { data: domains } = await resend.domains.list();
console.log(`Found ${domains?.data.length || 0} domain(s)`);

domains?.data.forEach((domain) => {
  console.log(`  - ${domain.name} (status: ${domain.status}, id: ${domain.id})`);
});

// 2. Get domain details (if any exist)
if (domains?.data.length) {
  const domainId = domains.data[0].id;

  console.log(`\n=== Domain Details: ${domains.data[0].name} ===`);
  const { data: domain } = await resend.domains.get(domainId);

  if (domain) {
    console.log("Name:", domain.name);
    console.log("Status:", domain.status);
    console.log("Region:", domain.region);
    console.log("Created:", domain.created_at);

    if (domain.records?.length) {
      console.log("\nDNS Records:");
      domain.records.forEach((record) => {
        console.log(`  ${record.type}: ${record.name} -> ${record.value}`);
      });
    }
  }

  // 3. Verify domain
  console.log("\n=== Verifying Domain ===");
  await resend.domains.verify(domainId);
  console.log("Domain verification initiated!");
}

console.log("\nDone!");
