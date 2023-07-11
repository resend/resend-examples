import { resend } from "./lib/resend";

async function verifyDomain() {
  try {
    const data = await resend.domains.verify(
      '8b262f10-f578-4278-aa9a-9e05a99e25ec',
    );

    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

verifyDomain();
