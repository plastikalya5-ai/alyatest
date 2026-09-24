import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'

// Yeni personel daveti — SADECE 'yonetim' modülüne sahip kullanıcılar çağırabilir.
// Service role key burada, sadece sunucu tarafında kullanılır; client'a asla gönderilmez.
export async function POST(req: NextRequest) {
  const sb = await createServerSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })

  // Çağıranın yetkisini KENDİ oturumuyla (RLS'e tabi) doğrula
  const { data: profile } = await sb.from('admin_profiles').select('role_id').eq('id', user.id).single()
  if (!profile?.role_id) return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
  const { data: role } = await sb.from('roller').select('moduller').eq('id', profile.role_id).single()
  const moduller: string[] = role?.moduller || []
  if (!(moduller.includes('*') || moduller.includes('yonetim')))
    return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })

  const { email, full_name } = await req.json()
  if (!email) return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 })

  const admin = createServiceClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name || null },
    redirectTo: `${new URL(req.url).origin}/admin/reset-password`,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, user_id: data.user?.id })
}
