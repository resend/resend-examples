import { resend } from "./lib/resend";

async function listDomains() {
  try {
    const data = await resend.domains.list();

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

listDomains();
