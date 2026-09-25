import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'

// Kullanıcı & rol yönetimi — sadece 'yonetim' modülüne sahip kullanıcılar erişebilir.
// auth.users tablosuna (e-posta, son giriş, ban durumu) sadece service_role erişebildiği için
// bu uçlar sunucu tarafında admin API kullanır; anahtar hiçbir zaman istemciye gönderilmez.

async function yetkiliMi() {
  const sb = await createServerSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { hata: NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 }) }
  const { data: profile } = await sb.from('admin_profiles').select('role_id').eq('id', user.id).single()
  const { data: role } = profile?.role_id ? await sb.from('roller').select('moduller').eq('id', profile.role_id).single() : { data: null }
  const moduller: string[] = role?.moduller || []
  if (!(moduller.includes('*') || moduller.includes('yonetim'))) return { hata: NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 }) }
  return { sb, user, admin: createServiceClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) }
}

export async function GET() {
  const y = await yetkiliMi(); if (y.hata) return y.hata
  const { sb, admin } = y as any

  const [{ data: profiller }, { data: roller }] = await Promise.all([
    sb.from('admin_profiles').select('*'),
    sb.from('roller').select('*').order('ad', { ascending: true }),
  ])

  // auth.users listesi sayfalıdır; personel sayısı için birkaç sayfa yeterlidir
  const kullanicilar: any[] = []
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    kullanicilar.push(...data.users)
    if (data.users.length < 200) break
  }

  const users = kullanicilar.map((u: any) => {
    const p = (profiller || []).find((x: any) => x.id === u.id)
    return {
      id: u.id, email: u.email, full_name: p?.full_name || u.user_metadata?.full_name || null, role_id: p?.role_id || null,
      created_at: u.created_at, last_sign_in_at: u.last_sign_in_at, email_confirmed_at: u.email_confirmed_at,
      banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
    }
  })
  return NextResponse.json({ users, roller: roller || [] })
}

export async function POST(req: NextRequest) {
  const y = await yetkiliMi(); if (y.hata) return y.hata
  const { sb, user, admin } = y as any
  const body = await req.json()
  const { action } = body

  try {
    if (action === 'invite') {
      const { email, full_name, role_id } = body
      if (!email) return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 })
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: full_name || null },
        redirectTo: `${new URL(req.url).origin}/admin/reset-password`,
      })
      if (error) throw new Error(error.message)
      if (role_id && data.user) { const r = await sb.from('admin_profiles').update({ role_id }).eq('id', data.user.id); if (r.error) throw new Error(r.error.message) }
      return NextResponse.json({ ok: true, user_id: data.user?.id })
    }
    if (action === 'resend') {
      const { email } = body
      const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${new URL(req.url).origin}/admin/reset-password` })
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }
    if (action === 'role') {
      const { id, role_id } = body
      const r = await sb.from('admin_profiles').update({ role_id: role_id || null }).eq('id', id)
      if (r.error) throw new Error(r.error.message)
      return NextResponse.json({ ok: true })
    }
    if (action === 'rename') {
      const { id, full_name } = body
      const r = await sb.from('admin_profiles').update({ full_name }).eq('id', id)
      if (r.error) throw new Error(r.error.message)
      return NextResponse.json({ ok: true })
    }
    if (action === 'ban' || action === 'unban') {
      const { id } = body
      if (id === user.id) return NextResponse.json({ error: 'Kendi hesabını pasife alamazsın' }, { status: 400 })
      const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: action === 'ban' ? '876000h' : 'none' })
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }
    if (action === 'delete') {
      const { id } = body
      if (id === user.id) return NextResponse.json({ error: 'Kendi hesabını silemezsin' }, { status: 400 })
      const { error } = await admin.auth.admin.deleteUser(id)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'İşlem başarısız' }, { status: 500 })
  }
}
