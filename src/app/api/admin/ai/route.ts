import { NextRequest, NextResponse } from 'next/server'
import { modulGerekli } from '@/lib/yetki'
import { oranSiniri } from '@/lib/rate-limit'
import { aiAktif, AiHata } from '@/lib/ai'
import { basvuruAnalizKaydet } from '@/lib/ai-basvuru'
import { sosyalIcerikUret, AMACLAR } from '@/lib/ai-sosyal'
import { teklifKalemOner } from '@/lib/ai-teklif'
import { araclariSuz } from '@/lib/ai-birim'
import { asistanYanit, belgeOku, ekstreOner, gorselAnalizEt, haftalikOzet, urunMetniUret, type Konusma } from '@/lib/ai-admin'

export const maxDuration = 60

// Yönetici paneli AI uçları. Her eylem kendi modül yetkisini ister; veriye erişen eylemler
// kullanıcının kendi oturumuyla (RLS + rpc_* içindeki yetki kontrolü) çalışır.
const YETKI: Record<string, string[]> = {
  urun_metin: ['yonetim'],
  sosyal_icerik: ['sosyal', 'yonetim'],
  teklif_kalem_oner: ['satis', 'yonetim'],
  gorsel_analiz: ['yonetim'],
  basvuru_analiz: ['dashboard'],
  asistan: [],                      // her personel; veri erişimi zaten RLS ile sınırlı
  ozet: [],                         // yalnızca yetkili olduğu modüllerin verisi kullanılır
  ekstre_oner: ['muhasebe'],
  belge_oku: ['muhasebe', 'satinalma', 'stok'],
}

export async function GET() {
  const y = await modulGerekli(); if (y.hata) return y.hata
  return NextResponse.json({ aktif: aiAktif() })
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 }) }
  const action = String(body?.action || '')
  if (!(action in YETKI)) return NextResponse.json({ error: 'Geçersiz eylem' }, { status: 400 })

  const y = await modulGerekli(YETKI[action]); if (y.hata) return y.hata
  if (!aiAktif()) return NextResponse.json({ error: 'AI özelliği henüz yapılandırılmamış (OPENAI_API_KEY).', kapali: true }, { status: 503 })

  // Kullanıcı başına saatlik sınır (maliyet koruması)
  if (!(await oranSiniri(`ai:${y.user.id}`, 80, 3600, false))) return NextResponse.json({ error: 'Saatlik AI kullanım sınırına ulaştın, biraz sonra tekrar dene.' }, { status: 429 })

  try {
    switch (action) {
      case 'urun_metin': {
        const p = body.urun || {}
        if (!p.name || typeof p.name !== 'string') return NextResponse.json({ error: 'Ürün adı gerekli' }, { status: 400 })
        const specs = p.specs && typeof p.specs === 'object' ? Object.fromEntries(Object.entries(p.specs).slice(0, 20).map(([k, v]) => [String(k).slice(0, 60), String(v).slice(0, 120)])) : {}
        const r = await urunMetniUret({
          name: p.name.slice(0, 160), code: String(p.code || '').slice(0, 40), category: String(p.category || '').slice(0, 60), subcategory: String(p.subcategory || '').slice(0, 60),
          specs, tags: Array.isArray(p.tags) ? p.tags.slice(0, 20).map((t: any) => String(t).slice(0, 40)) : [], description: String(p.description || '').slice(0, 1500), image_url: typeof p.image_url === 'string' ? p.image_url : undefined,
        })
        return NextResponse.json({ ok: true, sonuc: r })
      }
      case 'sosyal_icerik': {
        const platform = ['linkedin', 'instagram', 'facebook'].includes(body.platform) ? body.platform : null
        if (!platform) return NextResponse.json({ error: 'Platform geçersiz' }, { status: 400 })
        const amac = typeof body.amac === 'string' && body.amac in AMACLAR ? body.amac : 'urun'
        let urun: any
        if (body.urun_id) {
          if (typeof body.urun_id !== 'string' || !/^[0-9a-f-]{36}$/.test(body.urun_id)) return NextResponse.json({ error: 'Ürün geçersiz' }, { status: 400 })
          const { data } = await y.sb.from('products').select('name,code,category,subcategory,description,specs,tags').eq('id', body.urun_id).maybeSingle()
          if (!data) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
          urun = { ...data, specs: data.specs && typeof data.specs === 'object' ? Object.fromEntries(Object.entries(data.specs).slice(0, 20).map(([k, v]) => [String(k).slice(0, 60), String(v).slice(0, 120)])) : {}, description: String(data.description || '').slice(0, 1200) }
        }
        const { data: st } = await y.sb.from('settings').select('key,value').in('key', ['site', 'stats', 'export_countries'])
        const m = Object.fromEntries((st || []).map((r: any) => [r.key, r.value]))
        const firma = { sirket: m.site?.company, kurulus_yili: m.site?.founded, adres: m.site?.address, e_posta: m.site?.email, ihracat_e_posta: m.site?.export_email, telefon: m.site?.phone, ihracat_ulkeleri: Array.isArray(m.export_countries) ? m.export_countries.slice(0, 30).join(', ') : undefined, model_sayisi: m.stats?.models, ihracat_ulke_sayisi: m.stats?.countries }
        const sonuc = await sosyalIcerikUret({ platform, amac, dil: body.dil === 'en' ? 'en' : 'tr', adet: Number(body.adet) || 1, urun, firma, not: typeof body.not === 'string' ? body.not.slice(0, 600) : undefined })
        return NextResponse.json({ ok: true, sonuc })
      }
      case 'teklif_kalem_oner': {
        let mesaj = typeof body.metin === 'string' ? body.metin.slice(0, 3000) : ''
        if (body.basvuru_id) {
          if (typeof body.basvuru_id !== 'string' || !/^[0-9a-f-]{36}$/.test(body.basvuru_id)) return NextResponse.json({ error: 'Başvuru geçersiz' }, { status: 400 })
          const { data: b } = await y.sb.from('contact_submissions').select('name,company,subject,product,message').eq('id', body.basvuru_id).maybeSingle()
          if (!b) return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
          mesaj = [b.subject && `Konu: ${b.subject}`, b.product && `İlgilendiği ürün: ${b.product}`, b.message].filter(Boolean).join('\n').slice(0, 3000)
        }
        if (mesaj.trim().length < 5) return NextResponse.json({ error: 'Analiz edilecek metin yok' }, { status: 400 })
        const [v, p] = await Promise.all([y.sb.from('product_variants').select('id,product_id,name,color,size').limit(3000), y.sb.from('products').select('id,name').limit(3000)])
        const pn = new Map((p.data || []).map((x: any) => [x.id, x.name]))
        const katalog = (v.data || []).map((x: any) => ({ id: x.id, label: [pn.get(x.product_id), x.name, x.color, x.size].filter(Boolean).filter((a: any, i: number, arr: any[]) => arr.indexOf(a) === i).join(' · ') || x.name }))
        return NextResponse.json({ ok: true, sonuc: await teklifKalemOner(mesaj, katalog), katalogBos: katalog.length === 0 })
      }
      case 'gorsel_analiz': {
        if (typeof body.url !== 'string') return NextResponse.json({ error: 'Görsel adresi gerekli' }, { status: 400 })
        return NextResponse.json({ ok: true, sonuc: await gorselAnalizEt(body.url, body.ad) })
      }
      case 'basvuru_analiz': {
        if (typeof body.id !== 'string') return NextResponse.json({ error: 'Başvuru id gerekli' }, { status: 400 })
        // Başvurunun bu kullanıcıya görünür olduğunu kendi oturumuyla doğrula, sonra service_role ile yaz
        const { data } = await y.sb.from('contact_submissions').select('id').eq('id', body.id).maybeSingle()
        if (!data) return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
        return NextResponse.json({ ok: true, sonuc: await basvuruAnalizKaydet(body.id) })
      }
      case 'asistan': {
        const g: Konusma[] = (Array.isArray(body.mesajlar) ? body.mesajlar : []).slice(-10)
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
          .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1500) }))
        if (!g.length || g[g.length - 1].role !== 'user') return NextResponse.json({ error: 'Soru gerekli' }, { status: 400 })
        return NextResponse.json({ ok: true, ...(await asistanYanit(y.sb, g, araclariSuz(y.moduller))) })
      }
      case 'ozet':
        return NextResponse.json({ ok: true, ...(await haftalikOzet(y.sb, y.moduller)) })
      case 'ekstre_oner': {
        const rows = (Array.isArray(body.satirlar) ? body.satirlar : []).slice(0, 25).map((r: any) => ({ id: String(r.id), tarih: String(r.tarih || ''), yon: r.yon === 'giris' ? 'giris' : 'cikis', tutar: Number(r.tutar) || 0, aciklama: String(r.aciklama || '') }))
        if (!rows.length) return NextResponse.json({ error: 'Satır yok' }, { status: 400 })
        // Cari ve kategori listeleri istemciden değil, kullanıcının oturumundan (RLS) okunur
        const [c, k] = await Promise.all([y.sb.from('cari_hesaplar').select('id,ad').limit(300), y.sb.from('muhasebe_kategoriler').select('tip,ad')])
        const kat = { gelir: (k.data || []).filter((x: any) => x.tip === 'gelir').map((x: any) => x.ad), gider: (k.data || []).filter((x: any) => x.tip === 'gider').map((x: any) => x.ad) }
        return NextResponse.json({ ok: true, sonuc: await ekstreOner(rows, c.data || [], kat) })
      }
      case 'belge_oku': {
        if (typeof body.dosya !== 'string') return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
        return NextResponse.json({ ok: true, sonuc: await belgeOku(body.dosya) })
      }
    }
  } catch (e: any) {
    if (e instanceof AiHata) return NextResponse.json({ error: e.message }, { status: e.durum })
    console.error('[api/admin/ai]', action, e)
    return NextResponse.json({ error: 'AI işlemi başarısız oldu.' }, { status: 500 })
  }
  return NextResponse.json({ error: 'Geçersiz eylem' }, { status: 400 })
}
