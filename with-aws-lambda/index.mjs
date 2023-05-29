/* global fetch */
const RESEND_API_KEY = 're_123456789';

export const handler = async(event) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'user@example.com',
      subject: 'hello world',
      html: '<strong>it works!</strong>',
    })
  });
  
  if (res.ok) {
    const data = await res.json();
    
    return {
      statusCode: 200,
      body: data,
    };
  }
};