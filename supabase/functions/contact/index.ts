import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Hard cap request body size (defense against payload-bomb DoS)
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 16_000) {
      return new Response(
        JSON.stringify({ error: 'Payload too large.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, company, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strict input validation — type, length, and format
    const isStr = (v: unknown, max: number) => typeof v === 'string' && v.length > 0 && v.length <= max;
    if (!isStr(name, 200) || !isStr(email, 320) || !isStr(message, 5000) || (company && !isStr(company, 200))) {
      return new Response(
        JSON.stringify({ error: 'Invalid field length or type.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Block obvious header-injection / control characters
    if (/[\r\n\u0000-\u0008\u000b-\u001f]/.test(name) || /[\r\n\u0000-\u0008\u000b-\u001f]/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid characters in input.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Email service not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resend free tier only allows sending to the account owner's email
    const RECIPIENT = Deno.env.get('CONTACT_EMAIL') || 'nicolasroth001@gmail.com';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HFAI Team <noreply@hfa-i.org>',
        to: [RECIPIENT],
        reply_to: email,
        subject: `New inquiry from ${name} (${company || 'N/A'})`,
        text: `Name: ${name}\nCompany: ${company || 'N/A'}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('Resend error:', errorData);
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Email send error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to send email.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
