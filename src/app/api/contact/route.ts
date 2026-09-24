import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse, after } from 'next/server'
import { notify } from '@/lib/notify'

export async function POST(req: NextRequest) {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

  // Basit DB tabanlı rate limit: aynı IP saatte en fazla 5 gönderim yapabilir (spam/DDoS koruması)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'bilinmeyen'
  const anahtar = `contact:${ip}`
  const birSaatOnce = new Date(Date.now() - 60*60*1000).toISOString()
  const { count } = await sb.from('rate_limit_kayitlari').select('id',{count:'exact',head:true}).eq('anahtar',anahtar).gte('created_at',birSaatOnce)
  if ((count||0) >= 5) {
    return NextResponse.json({ error: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.' }, { status: 429 })
  }
  await sb.from('rate_limit_kayitlari').insert({ anahtar })

  const payload = await req.json()
  const { error } = await sb.from('contact_submissions').insert(payload)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Yanıtı geciktirmeden bildirim gönder (e-posta / WhatsApp)
  after(() => notify(
    'new_contact',
    `Yeni başvuru: ${payload.name ?? ''}`,
    [
      'Alya Plastik sitesinden yeni iletişim formu geldi.',
      `Ad: ${payload.name ?? '-'}`,
      `Firma: ${payload.company ?? '-'}`,
      `E-posta: ${payload.email ?? '-'}`,
      `Telefon: ${payload.phone ?? '-'}`,
      `Konu: ${payload.subject ?? '-'}`,
      `Mesaj: ${payload.message ?? '-'}`,
    ].join('\n'),
    { name: payload.name, email: payload.email, phone: payload.phone },
  ))
  return NextResponse.json({ ok: true })
}
