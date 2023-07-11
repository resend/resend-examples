import { resend } from "./lib/resend";

async function removeDomain() {
  try {
    const data = await resend.domains.remove(
      '5a853c4e-1c88-4983-acff-f8f3e3638378',
    );

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

removeDomain();
