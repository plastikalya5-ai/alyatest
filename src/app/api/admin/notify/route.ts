import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { channelStatus, sendEmail, sendWhatsApp } from '@/lib/notify'

// Bildirim kanallarının durumu (GET) ve test gönderimi (POST) — sadece 'yonetim' yetkisi.
async function yetkili() {
  const sb = await createServerSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })
  const { data: profile } = await sb.from('admin_profiles').select('role_id').eq('id', user.id).single()
  if (!profile?.role_id) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
  const { data: role } = await sb.from('roller').select('moduller').eq('id', profile.role_id).single()
  const m: string[] = role?.moduller || []
  if (!(m.includes('*') || m.includes('yonetim'))) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
  return null
}

export async function GET() {
  const red = await yetkili(); if (red) return red
  return NextResponse.json(channelStatus())
}

export async function POST(req: NextRequest) {
  const red = await yetkili(); if (red) return red
  const { channel, to } = await req.json()
  if (!to || !['email', 'whatsapp'].includes(channel))
    return NextResponse.json({ error: 'Alıcı adres/numara gerekli' }, { status: 400 })
  const text = 'Alya Plastik admin paneli test bildirimi. Bu mesajı aldıysan kanal çalışıyor ✓'
  try {
    if (channel === 'email') await sendEmail(to, 'Alya Plastik — test bildirimi', text)
    else await sendWhatsApp('test', to, text, {})
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Gönderilemedi' }, { status: 502 })
  }
}
