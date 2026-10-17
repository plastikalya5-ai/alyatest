import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { istemciIp } from '@/lib/rate-limit'
import { yoneticiOlayi } from '@/lib/olay'

// GERİ DÖNÜŞÜ OLMAYAN işlem: tüm tabloların içini, depolama dosyalarını ve tüm giriş hesaplarını siler.
// Yalnızca TAM YETKİLİ (*) yönetici; sunucu tarafında "imha et" yazılı onayı da aranır.
export const maxDuration = 60

const ONAY = 'imha et'

async function yetkili() {
  const sb = await createServerSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { hata: NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 }) }
  const { data: profile } = await sb.from('admin_profiles').select('role_id').eq('id', user.id).single()
  const { data: role } = profile?.role_id ? await sb.from('roller').select('moduller').eq('id', profile.role_id).single() : { data: null }
  if (!((role?.moduller || []) as string[]).includes('*')) return { hata: NextResponse.json({ error: 'Bu işlem için tam yetki gerekir' }, { status: 403 }) }
  return { user, admin: createServiceClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) }
}

async function kovaYollari(admin: any, kova: string, onek = '', out: string[] = []) {
  for (let off = 0; ; off += 1000) {
    const { data, error } = await admin.storage.from(kova).list(onek, { limit: 1000, offset: off })
    if (error) throw new Error(`${kova}: ${error.message}`)
    if (!data?.length) break
    for (const o of data) {
      const yol = onek ? `${onek}/${o.name}` : o.name
      if (o.id === null) await kovaYollari(admin, kova, yol, out)
      else out.push(yol)
    }
    if (data.length < 1000) break
  }
  return out
}

export async function POST(req: NextRequest) {
  const y = await yetkili(); if (y.hata) return y.hata
  const { user, admin } = y as any
  const body = await req.json().catch(() => ({}))
  if (String(body?.onay || '').trim().toLocaleLowerCase('tr-TR') !== ONAY)
    return NextResponse.json({ error: `Onay için "${ONAY}" yazılmalı` }, { status: 400 })

  const sonuc = { tablo: 0, dosya: 0, kullanici: 0, hatalar: [] as string[] }
  try {
    // Önce bildirim (bildirim ayarları tablolarla birlikte silineceği için en başta)
    await yoneticiOlayi(user.email || user.id, 'sistem_imha_edildi', 'Tüm veriler, dosyalar ve hesaplar silindi', istemciIp(req)).catch(() => {})

    // 1) Tablolar
    const { data: n, error: e1 } = await admin.rpc('imha_verileri')
    if (e1) {
      // Tablolar boşaltılamadıysa dosya ve hesaplara DOKUNULMAZ (yarım imha olmasın)
      return NextResponse.json({ error: `Tablolar boşaltılamadı, hiçbir şey silinmedi: ${e1.message}` }, { status: 500 })
    }
    sonuc.tablo = Number(n) || 0

    // 2) Depolama dosyaları (kovalar kalır, içleri boşalır)
    const { data: kovalar } = await admin.storage.listBuckets()
    for (const k of kovalar || []) {
      try {
        const yollar = await kovaYollari(admin, k.name)
        for (let i = 0; i < yollar.length; i += 100) {
          const { error } = await admin.storage.from(k.name).remove(yollar.slice(i, i + 100))
          if (error) sonuc.hatalar.push(`${k.name}: ${error.message}`)
          else sonuc.dosya += Math.min(100, yollar.length - i)
        }
      } catch (e: any) { sonuc.hatalar.push(e?.message || `${k.name} silinemedi`) }
    }

    // 3) Giriş hesapları — işlemi yapan en son silinir
    const idler: string[] = []
    for (let sayfa = 1; ; sayfa++) {
      const { data, error } = await admin.auth.admin.listUsers({ page: sayfa, perPage: 200 })
      if (error) { sonuc.hatalar.push(`Kullanıcı listesi: ${error.message}`); break }
      const u = data?.users || []
      idler.push(...u.map((x: any) => x.id))
      if (u.length < 200) break
    }
    for (const id of [...idler.filter(i => i !== user.id), ...idler.filter(i => i === user.id)]) {
      const { error } = await admin.auth.admin.deleteUser(id)
      if (error) sonuc.hatalar.push(`Kullanıcı ${id}: ${error.message}`)
      else sonuc.kullanici++
    }
  } catch (e: any) {
    sonuc.hatalar.push(e?.message || 'Beklenmeyen hata')
  }
  return NextResponse.json({ ok: sonuc.hatalar.length === 0, ...sonuc }, { status: sonuc.hatalar.length ? 207 : 200 })
}
