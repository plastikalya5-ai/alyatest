import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// Muhasebe modülüne ait tablolar — sadece bunlara erişilebilir.
// Gerçek yetki kontrolü RLS (private.has_module) tarafından yapılır; bu allowlist ek bir savunma katmanı.
const TABLES = new Set([
  'cari_hesaplar','faturalar','fatura_kalemleri','islemler','muhasebe_kategoriler',
  'kasa_banka_hesaplari','cek_senet','product_variants','products',
])

async function requireSession() {
  const sb = await createServerSupabase()
  const { data: { user } } = await sb.auth.getUser()
  return { sb, user }
}

export async function GET(req: NextRequest) {
  const { sb, user } = await requireSession()
  if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })

  const p = Object.fromEntries(new URL(req.url).searchParams)
  const { table, select='*', order, order_asc='false', eq, gte, lte, limit, count } = p
  if (!table || !TABLES.has(table))
    return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })

  let q: any = sb.from(table).select(select, count==='true'?{count:'exact',head:true}:undefined)
  if (eq)  { const [f,...r]=eq.split(':');  q=q.eq(f,r.join(':')) }
  if (gte) { const [f,...r]=gte.split(':'); q=q.gte(f,r.join(':')) }
  if (lte) { const [f,...r]=lte.split(':'); q=q.lte(f,r.join(':')) }
  if (order) q=q.order(order,{ascending:order_asc==='true'})
  if (limit) q=q.limit(+limit)
  const { data, error, count:cnt } = await q
  if (error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ data, count: cnt })
}

export async function POST(req: NextRequest) {
  const { sb, user } = await requireSession()
  if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })

  const { table, op, data, id } = await req.json()
  if (!table || !TABLES.has(table))
    return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })

  let r: any
  if (op === 'insert') {
    const payload = Array.isArray(data) ? data.map(d=>({...d, created_by:user.id})) : { ...data, created_by: user.id }
    r = await sb.from(table).insert(payload).select()
  } else if (op === 'update') {
    r = await sb.from(table).update({ ...data, updated_by: user.id }).eq('id', id).select()
  } else if (op === 'delete') {
    r = await sb.from(table).delete().eq('id', id)
  } else if (op === 'upsert') {
    const payload = Array.isArray(data) ? data.map(d=>({...d, created_by:user.id})) : { ...data, created_by: user.id }
    r = await sb.from(table).upsert(payload).select()
  } else {
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
  }
  if (r?.error) return NextResponse.json({ error: r.error.message }, { status: 500 })

  const recordId = id || r?.data?.[0]?.id
  sb.from('admin_activity').insert({ action: op, table_name: table, record_id: recordId, user_id: user.id }).then(()=>{})

  return NextResponse.json({ ok: true, data: r?.data })
}
