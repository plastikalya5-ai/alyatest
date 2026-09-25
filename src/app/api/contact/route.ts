import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse, after } from 'next/server'
import { notify } from '@/lib/notify'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SUBJECTS = new Set(['Ürün Bilgisi', 'Fiyat Talebi', 'İhracat', 'Katalog', 'Özel Kalıp', 'Diğer'])

// Yalnızca bilinen alanları alır, tipleri ve uzunlukları doğrular (rastgele kolon/devasa metin yazımını engeller).
function temizle(body: unknown) {
  if (!body || typeof body !== 'object') return { hata: 'Geçersiz istek.' }
  const b = body as Record<string, unknown>
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

  const name = str(b.name, 120)
  const email = str(b.email, 200)
  const message = str(b.message, 4000)
  if (!name) return { hata: 'Ad Soyad gerekli.' }
  if (!EMAIL_RE.test(email)) return { hata: 'Geçerli bir e-posta girin.' }
  if (!message) return { hata: 'Mesaj gerekli.' }

  const subject = str(b.subject, 60)
  return {
    veri: {
      name,
      company: str(b.company, 160) || null,
      email,
      phone: str(b.phone, 40) || null,
      subject: SUBJECTS.has(subject) ? subject : null,
      message,
    },
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }) }

  const { veri, hata } = temizle(body)
  if (hata || !veri) return NextResponse.json({ error: hata }, { status: 400 })

  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

  // Basit DB tabanlı rate limit: aynı IP saatte en fazla 5 gönderim yapabilir (spam/DDoS koruması).
  // Vercel, gerçek istemci IP'sini x-real-ip / x-vercel-forwarded-for ile verir; x-forwarded-for'un ilk değeri istemci tarafından taklit edilebilir.
  const ip =
    req.headers.get('x-real-ip') ||
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    'bilinmeyen'
  const anahtar = `contact:${ip}`
  const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await sb.from('rate_limit_kayitlari').select('id', { count: 'exact', head: true }).eq('anahtar', anahtar).gte('created_at', birSaatOnce)
  if ((count || 0) >= 5) {
    return NextResponse.json({ error: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.' }, { status: 429 })
  }
  await sb.from('rate_limit_kayitlari').insert({ anahtar })

  const { error } = await sb.from('contact_submissions').insert(veri)
  if (error) {
    console.error('[contact] kayıt hatası:', error.message)
    return NextResponse.json({ error: 'Mesaj kaydedilemedi, lütfen tekrar deneyin.' }, { status: 500 })
  }

  // Yanıtı geciktirmeden bildirim gönder (e-posta / WhatsApp)
  after(() => notify(
    'new_contact',
    `Yeni başvuru: ${veri.name}`,
    [
      'Alya Plastik sitesinden yeni iletişim formu geldi.',
      `Ad: ${veri.name}`,
      `Firma: ${veri.company ?? '-'}`,
      `E-posta: ${veri.email}`,
      `Telefon: ${veri.phone ?? '-'}`,
      `Konu: ${veri.subject ?? '-'}`,
      `Mesaj: ${veri.message}`,
    ].join('\n'),
    { name: veri.name, email: veri.email, phone: veri.phone },
  ))
  return NextResponse.json({ ok: true })
}
