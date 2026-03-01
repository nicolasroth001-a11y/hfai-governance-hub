import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, company, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const CONTACT_EMAIL = Deno.env.get('CONTACT_EMAIL');
    const CONTACT_EMAIL_APP_PASSWORD = Deno.env.get('CONTACT_EMAIL_APP_PASSWORD');

    if (!CONTACT_EMAIL || !CONTACT_EMAIL_APP_PASSWORD) {
      console.error('Missing email configuration');
      return new Response(
        JSON.stringify({ error: 'Email service not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Gmail SMTP via fetch to smtp-relay or use a simple approach
    // Since Deno doesn't have nodemailer, we'll use the Gmail SMTP API
    const emailBody = `Name: ${name}\nCompany: ${company || 'N/A'}\nEmail: ${email}\n\nMessage:\n${message}`;
    
    // Construct the email in RFC 2822 format
    const rawEmail = [
      `From: "HFAI Contact Form" <${CONTACT_EMAIL}>`,
      `To: nicolasroth001@gmail.com`,
      `Reply-To: ${email}`,
      `Subject: New inquiry from ${name} (${company || 'N/A'})`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      emailBody,
    ].join('\r\n');

    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Get OAuth2 access token using Gmail API with app password via SMTP
    // Alternative: Use a simple SMTP connection
    // For Gmail with app passwords, we'll use the Deno smtp client
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: CONTACT_EMAIL,
          password: CONTACT_EMAIL_APP_PASSWORD,
        },
      },
    });

    await client.send({
      from: CONTACT_EMAIL,
      to: "nicolasroth001@gmail.com",
      replyTo: email,
      subject: `New inquiry from ${name} (${company || 'N/A'})`,
      content: emailBody,
    });

    await client.close();

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
