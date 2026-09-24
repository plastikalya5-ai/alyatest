import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
  return NextResponse.json({ ok: true })
}
