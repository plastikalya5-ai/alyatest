import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Sunucu tarafı bildirim gönderici.
// notification_settings tablosu RLS ile korunduğu için service_role ile okunur.
// E-posta: SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
// WhatsApp: N8N_WHATSAPP_WEBHOOK_URL (+ opsiyonel N8N_WEBHOOK_SECRET)
// Tanımlı değilse ilgili kanal sessizce atlanır (loglanır), site akışı bozulmaz.

export type NotifyEvent = 'new_contact' | 'new_visit_milestone'

function admin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil')
  return createClient(url, key, { auth: { persistSession: false } })
}

export { admin as supabaseAdmin }

async function sendEmail(to: string, subject: string, text: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[notify] SMTP ayarı yok, e-posta atlandı')
    return
  }
  const port = Number(SMTP_PORT || 465)
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to, subject, text })
}

async function sendWhatsApp(event: NotifyEvent, to: string, message: string, data: unknown) {
  const url = process.env.N8N_WHATSAPP_WEBHOOK_URL
  if (!url) {
    console.warn('[notify] N8N_WHATSAPP_WEBHOOK_URL yok, WhatsApp atlandı')
    return
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({ event, to, message, data }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`n8n webhook ${res.status}`)
}

export async function notify(event: NotifyEvent, subject: string, message: string, data: unknown = {}) {
  try {
    const { data: row, error } = await admin()
      .from('notification_settings')
      .select('*')
      .eq('event', event)
      .maybeSingle()
    if (error) throw error
    if (!row) return

    const jobs: Promise<unknown>[] = []
    if (row.email_enabled && row.email_to) jobs.push(sendEmail(row.email_to, subject, message))
    if (row.whatsapp_enabled && row.whatsapp_to) jobs.push(sendWhatsApp(event, row.whatsapp_to, message, data))

    const results = await Promise.allSettled(jobs)
    results.forEach(r => { if (r.status === 'rejected') console.error('[notify] gönderim hatası:', r.reason) })
  } catch (e) {
    console.error('[notify] hata:', e)
  }
}
