import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = 're_123456789';

const handler = async (_request: Request): Promise<Response> => {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev',
            subject: 'hello world',
            html: '<strong>it works!</strong>',
        })
    });

    if (res.ok) {
        const data = await res.json();

        return new Response(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

serve(handler);