import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 16_000) {
      return new Response(JSON.stringify({ error: 'Payload too large.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { name, company, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const isStr = (v: unknown, max: number) => typeof v === 'string' && v.length > 0 && v.length <= max;
    if (!isStr(name, 200) || !isStr(email, 320) || !isStr(message, 5000) || (company && !isStr(company, 200))) {
      return new Response(JSON.stringify({ error: 'Invalid field length or type.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (/[\r\n\u0000-\u0008\u000b-\u001f]/.test(name) || /[\r\n\u0000-\u0008\u000b-\u001f]/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid characters in input.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const idempotencyKey = `contact-${crypto.randomUUID()}`;

    // Send inquiry to admin
    const { error: adminErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'contact-inquiry',
        idempotencyKey,
        templateData: { name, company: company || '', email, message },
      },
    });
    if (adminErr) {
      console.error('Admin notification failed:', adminErr);
      throw new Error('Failed to send inquiry');
    }

    // Send confirmation to user (non-blocking)
    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'contact-confirmation',
          recipientEmail: email,
          idempotencyKey: `${idempotencyKey}-confirm`,
          templateData: { name },
        },
      });
    } catch (e) {
      console.error('User confirmation failed (non-fatal):', e);
    }

    return new Response(JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Contact send error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
