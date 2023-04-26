require('dotenv').config();

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyDomain() {
  try {
    const data = await resend.domains.verify(
      '8b262f10-f578-4278-aa9a-9e05a99e25ec'
    );

    console.log(data);
  }
  catch(error) {
    console.error(error);
  }
}

verifyDomain();