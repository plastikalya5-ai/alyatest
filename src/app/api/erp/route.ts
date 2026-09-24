import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { applyQuery, withCreatedBy, withUpdatedBy } from '@/lib/proxy-query'

// ERP modülüne ait tablolar — sadece bunlara erişilebilir (arbitrary table proxy DEĞİL).
const TABLES = new Set([
  'depolar','hammaddeler','hammadde_lotlari','stok_hareketleri',
  'makineler','kaliplar','kalip_bakim_kayitlari','urun_receteleri','recete_kalemleri',
  'satis_siparisleri','satis_siparisi_kalemleri','satinalma_siparisleri','satinalma_siparisi_kalemleri',
  'uretim_emirleri','uretim_hareketleri',
  'sevkiyatlar','ihracat_detaylari',
  'kalite_kontrol_kayitlari','fire_kayitlari',
  'roller','kasa_banka_hesaplari',
  'fiyat_listeleri','fiyat_listesi_kalemleri','iskonto_kademeleri','banka_ekstre_kayitlari',
])

// Salt-okunur view'lar — sadece GET (select) izinli, hiçbir yazma işlemi yapılamaz.
const READONLY_VIEWS = new Set([
  'v_uretim_emirleri','v_urun_maliyet','v_kalip_bakim_durumu',
  'v_kritik_hammaddeler','v_kritik_urunler','v_uretim_fire_orani',
  'v_stok_defteri','v_cari_ozet','v_rezerve','v_sevk_edilen','v_hammadde_tuketim','v_kalip_baski','v_depo_ozet',
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
  const sp = new URL(req.url).searchParams
  const table = sp.get('table') || ''
  const select = sp.get('select') || '*'
  const count = sp.get('count')
  if (!table || !(TABLES.has(table) || READONLY_VIEWS.has(table)))
    return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })

  const tot = sp.get('total')
  let q: any = sb.from(table).select(select, count==='true' ? { count: 'exact', head: true } : tot ? { count: tot === 'estimated' ? 'estimated' : 'exact' } : undefined)
  q = applyQuery(q, sp)
  const { data, error, count:cnt } = await q
  if (error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ data, count: cnt })
}

export async function POST(req: NextRequest) {
  const { sb, user } = await requireSession()
  if (!user) return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })

  const body = await req.json()
  if (body.rpc) {
    // Yalnızca yetkiyi kendi içinde kontrol eden rpc_* fonksiyonları
    if (!/^rpc_[a-z_]+$/.test(body.rpc)) return NextResponse.json({ error: 'Geçersiz fonksiyon' }, { status: 400 })
    const r = await sb.rpc(body.rpc, body.args || {})
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
    return NextResponse.json({ data: r.data })
  }
  const { table, op, data, id } = body
  if (!table || !TABLES.has(table))
    return NextResponse.json({ error: 'Geçersiz tablo' }, { status: 400 })

  let r: any
  if (op === 'insert') {
    r = await sb.from(table).insert(withCreatedBy(table, data, user.id)).select()
  } else if (op === 'update') {
    r = await sb.from(table).update(withUpdatedBy(table, data, user.id)).eq('id', id).select()
  } else if (op === 'delete') {
    r = await sb.from(table).delete().eq('id', id)
  } else if (op === 'upsert') {
    r = await sb.from(table).upsert(withCreatedBy(table, data, user.id)).select()
  } else {
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
  }
  if (r?.error) return NextResponse.json({ error: r.error.message }, { status: 500 })

  const recordId = id || r?.data?.[0]?.id
  sb.from('admin_activity').insert({ action: op, table_name: table, record_id: recordId, user_id: user.id }).then(()=>{})

  return NextResponse.json({ ok: true, data: r?.data })
}
