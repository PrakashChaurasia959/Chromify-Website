// Supabase Edge Function: send-enquiry-email
// Triggered on new customer enquiry submission
// Recipient: Chromify30@gmail.com

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EnquiryPayload {
  name: string
  phone: string
  email: string
  message: string
  product_name?: string
  product_id?: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, phone, email, message, product_name }: EnquiryPayload = await req.json()

    // Server-side validation
    if (!name || !phone || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: name, phone, email, and message are required.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const businessEmail = 'Chromify30@gmail.com'
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    // If Resend API Key is not set in Supabase secrets, report configuration state honestly
    if (!resendApiKey) {
      console.warn(
        'RESEND_API_KEY environment secret is not configured in Supabase. Email alert was not dispatched, but enquiry is preserved.'
      )
      return new Response(
        JSON.stringify({
          success: true,
          emailDispatched: false,
          warning:
            'Enquiry saved in database, but RESEND_API_KEY secret is not yet set in Supabase Edge Functions. Please add RESEND_API_KEY to receive email alerts.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Compose HTML email notification
    const emailSubject = `🔔 New Customer Enquiry from ${name} — Chromify`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #EC4899 100%); padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">CHROMIFY</h1>
          <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">New Customer Product Enquiry</p>
        </div>

        <div style="padding: 24px 8px 12px;">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">You have received a new customer enquiry on your website:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569; width: 35%;">Customer Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Phone Number:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
                <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
                <span style="margin-left: 8px;">
                  <a href="https://wa.me/91${phone.replace(/\D/g, '').replace(/^91/, '')}" style="color: #16a34a; font-weight: bold; text-decoration: none;">(WhatsApp)</a>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
              </td>
            </tr>
            ${
              product_name
                ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Interested Product:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #7c3aed; font-weight: bold;">${product_name}</td>
            </tr>`
                : ''
            }
          </table>

          <div style="background: #f8fafc; border-left: 4px solid #8B5CF6; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-weight: bold; color: #334155; font-size: 13px; text-transform: uppercase;">Message:</p>
            <p style="margin: 0; color: #1e293b; white-space: pre-wrap; font-size: 15px;">${message}</p>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="mailto:${email}?subject=Reply%20from%20Chromify" style="background: #8B5CF6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 8px;">Reply via Email</a>
            <a href="https://wa.me/91${phone.replace(/\D/g, '').replace(/^91/, '')}" style="background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Open WhatsApp Chat</a>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">Chromify — Kasia, Kushinagar, UP 274402 | Phone: 9336333840 | Email: Chromify30@gmail.com</p>
        </div>
      </div>
    `

    // Dispatch email via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Chromify Website <onboarding@resend.dev>',
        to: [businessEmail],
        reply_to: email,
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error('Resend API error:', resData)
      return new Response(
        JSON.stringify({
          success: true,
          emailDispatched: false,
          warning: `Enquiry saved in database, but email delivery service responded with error: ${resData.message || 'Check Resend credentials'}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailDispatched: true,
        emailId: resData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Edge function runtime error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error in email service',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
