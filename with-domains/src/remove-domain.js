require('dotenv').config();

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function removeDomain() {
  try {
    const data = await resend.domains.remove(
      '5a853c4e-1c88-4983-acff-f8f3e3638378'
    );

    console.log(data);
  }
  catch(error) {
    console.error(error);
  }
}

removeDomain();