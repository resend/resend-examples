export default {
  async fetch(request, env, ctx) {
    const RESEND_API_KEY = 're_123456789';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'user@example.com',
        subject: 'hello world',
        html: '<strong>it works!</strong>'
      })
    });
    
    const results = await gatherResponse(response);
    return new Response(results, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    /**
     * gatherResponse awaits and returns a response body as a string.
     * Use await gatherResponse(..) in an async function to get the response body
     * @param {Response} response
     */
    async function gatherResponse(response) {
      const { headers } = response;
      const contentType = headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
      }
      return response.text();
    }
  },
};