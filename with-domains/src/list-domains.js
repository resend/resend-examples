require('dotenv').config();

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function listDomains() {
  try {
    const data = await resend.domains.list();

    console.log(data);
  }
  catch(error) {
    console.error(error);
  }
}

listDomains();