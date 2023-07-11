import { resend } from "./lib/resend";

async function createDomain() {
  try {
    const data = await resend.domains.create({
      name: 'example.com',
    });

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

createDomain();
