require('dotenv').config();

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function createDomain() {
  try {
    const data = await resend.domains.create({
      name: 'example.com',
    });

    console.log(data);
  }
  catch(error) {
    console.error(error);
  }
}

createDomain();