'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { webAll } from '@/lib/web-data'
import { useModuller } from '@/lib/use-moduller'
import { useUretim, byId, EMIR_DURUM, SIPARIS_ACIK, sevkEdilen } from '@/lib/uretim-utils'
import { fmt, fmtK, fmtInt, fmtN, fmtDate, todayISO, daysBetween } from '@/lib/fmt'
import { sum, pctDelta, isPnl, sonAylar, ayAnahtar, kalanTutar, acikFatura, iso } from '@/lib/muh-utils'
import { Page, Kpi, KpiGrid, Card, Badge, Money, Empty, Skeleton } from '@/components/admin/erp/ui'
import { TrendChart } from '@/components/admin/erp/charts'
import {
  Wallet, HandCoins, Scale, Factory, AlertTriangle, ClipboardList, Boxes, MessageSquare, Eye, ChevronRight, CheckCircle2, Circle, ScanLine, Receipt, Plus, PackageSearch, Activity, Sparkles, ArrowRight,
} from 'lucide-react'

type Alert = { tone: 'red' | 'amber' | 'blue'; text: string; href: string; mod: string }

export default function AdminDashboardPage() {
  const { has, email, ready } = useModuller()
  const A = { fin: has('muhasebe'), stok: has('stok'), uretim: has('uretim'), satis: has('satis'), satin: has('satinalma'), kalite: has('kalite'), sevk: has('sevkiyat'), web: has('dashboard') }

  const keys = useMemo(() => {
    if (!ready) return [] as any[]
    const k = new Set<string>(['products', 'variants'])
    if (A.stok || A.uretim || A.satin || A.kalite) { k.add('hammaddeler'); k.add('stokHareketleri') }
    if (A.uretim || A.satis || A.kalite) { k.add('emirler'); k.add('hareketler') }
    if (A.uretim) { k.add('makineler'); k.add('kaliplar'); k.add('receteler') }
    if (A.satis || A.sevk) { k.add('siparisler'); k.add('siparisKalemleri'); k.add('sevkiyatlar') }
    if (A.satin) k.add('satinalma')
    if (A.kalite) k.add('kalite')
    if (A.fin) k.add('fiyatListeleri')
    return Array.from(k) as any[]
  }, [ready]) // eslint-disable-line
  const { d, loading } = useUretim(keys as any)
  const g = (k: string): any[] => (d as any)[k] || []

  const [fin, setFin] = useState<any>(null)
  const [web, setWeb] = useState<any>(null)
  useEffect(() => {
    if (!ready) return
    if (A.fin) Promise.all([muh.all('islemler', 'tip,tutar,tarih,kategori'), muh.all('faturalar', 'id,tip,durum,toplam,odenen_tutar,vade,no,cari_id,tarih'), muh.all('kasa_banka_hesaplari', 'id,ad,bakiye,aktif'), muh.all('cari_hesaplar', 'id,ad,tip,bakiye'), muh.all('cek_senet', 'id,durum,vade_tarihi,tutar,yon')])
      .then(([islemler, faturalar, kasalar, cariler, cekler]) => setFin({ islemler, faturalar, kasalar, cariler, cekler })).catch(() => setFin({ islemler: [], faturalar: [], kasalar: [], cariler: [], cekler: [] }))
    if (A.web) Promise.all([webAll('contact_submissions', 'id,name,email,status,created_at,subject', q => q.order('created_at', { ascending: false })), webAll('site_visits', 'visited_at', q => q.order('visited_at', { ascending: false }))])
      .then(([basvurular, ziyaretler]) => setWeb({ basvurular, ziyaretler })).catch(() => setWeb({ basvurular: [], ziyaretler: [] }))
  }, [ready]) // eslint-disable-line

  const bugun = todayISO(), ay = bugun.slice(0, 7)
  const isim = email.split('@')[0]
  const saatSel = new Date().getHours() < 12 ? 'Günaydın' : new Date().getHours() < 18 ? 'İyi günler' : 'İyi akşamlar'

  /* ── Finans ── */
  const F = useMemo(() => {
    if (!fin) return null
    const pnl = fin.islemler.filter(isPnl)
    const pm = new Date(); pm.setMonth(pm.getMonth() - 1); const onceki = iso(pm).slice(0, 7)
    const gel = (a: string) => sum(pnl.filter((i: any) => i.tip === 'gelir' && (i.tarih || '').startsWith(a)), (i: any) => i.tutar), gid = (a: string) => sum(pnl.filter((i: any) => i.tip === 'gider' && (i.tarih || '').startsWith(a)), (i: any) => i.tutar)
    const aylar = sonAylar(12)
    const acik = fin.faturalar.filter(acikFatura)
    return {
      nakit: sum(fin.kasalar.filter((k: any) => k.aktif !== false), (k: any) => k.bakiye), alacak: sum(fin.cariler.filter((c: any) => +c.bakiye > 0), (c: any) => c.bakiye), borc: sum(fin.cariler.filter((c: any) => +c.bakiye < 0), (c: any) => -c.bakiye),
      net: gel(ay) - gid(ay), netOnceki: gel(onceki) - gid(onceki), gelir: gel(ay), gider: gid(ay),
      aylar, gelirSeri: aylar.map(a => gel(a.key)), giderSeri: aylar.map(a => gid(a.key)),
      gecikmis: acik.filter((f: any) => f.tip !== 'iade' && f.vade && f.vade < bugun), taslak: fin.faturalar.filter((f: any) => f.durum === 'taslak').length,
      cekGecik: fin.cekler.filter((c: any) => c.durum === 'portfoyde' && c.vade_tarihi < bugun), karsiliksiz: fin.cekler.filter((c: any) => c.durum === 'karsiliksiz'),
      negatif: fin.kasalar.filter((k: any) => +k.bakiye < 0),
      vadeler: [...acik.filter((f: any) => f.vade && f.tip !== 'iade').map((f: any) => ({ t: f.no, tarih: f.vade, tutar: kalanTutar(f), giris: f.tip === 'satis', cari: fin.cariler.find((c: any) => c.id === f.cari_id)?.ad })), ...fin.cekler.filter((c: any) => c.durum === 'portfoyde').map((c: any) => ({ t: c.yon === 'alinan' ? 'Alınan çek/senet' : 'Verilen çek/senet', tarih: c.vade_tarihi, tutar: +c.tutar, giris: c.yon === 'alinan' }))].sort((a, b) => a.tarih.localeCompare(b.tarih)).slice(0, 6),
    }
  }, [fin]) // eslint-disable-line

  /* ── Operasyon ── */
  const cari = useMemo(() => byId(fin?.cariler || []), [fin])
  const urun = useMemo(() => byId(g('products')), [d]) // eslint-disable-line
  const openS = g('siparisler').filter((s: any) => SIPARIS_ACIK.includes(s.durum))
  const sTutar = (s: any) => sum(g('siparisKalemleri').filter((k: any) => k.siparis_id === s.id), (k: any) => (+k.miktar || 0) * (+k.birim_fiyat || 0))
  const gecS = openS.filter((s: any) => s.teslim_tarihi && s.teslim_tarihi < bugun)
  const hazirBekleyen = g('siparisler').filter((s: any) => s.durum === 'hazir')
  const kritik = g('hammaddeler').filter((h: any) => h.aktif !== false && (+h.mevcut_stok || 0) <= (+h.min_stok || 0))
  const tukenMamul = g('variants').filter((v: any) => (+v.stock || 0) <= 0)
  const uretimde = g('emirler').filter((e: any) => e.durum === 'uretimde')
  const bugunH = g('hareketler').filter((h: any) => (h.tarih || '').startsWith(bugun))
  const bakimKalip = g('kaliplar').filter((k: any) => k.sonraki_bakim && daysBetween(bugun, k.sonraki_bakim) <= 14)
  const arizaMakine = g('makineler').filter((m: any) => m.durum === 'arizali')
  const gecEmir = g('emirler').filter((e: any) => ['planlandi', 'uretimde', 'durduruldu'].includes(e.durum) && g('siparisler').find((s: any) => s.id === e.siparis_id)?.teslim_tarihi < bugun)
  const gecSatin = g('satinalma').filter((s: any) => ['beklemede', 'onaylandi', 'yolda'].includes(s.durum) && s.beklenen_teslim && s.beklenen_teslim < bugun)
  const kontrolBekleyen = g('emirler').filter((e: any) => e.durum === 'tamamlandi' && +e.uretilen_miktar > 0 && !g('kalite').some((k: any) => k.uretim_emri_id === e.id && k.kontrol_tipi === 'son_kontrol'))
  const yeniBasvuru = (web?.basvurular || []).filter((b: any) => (b.status || 'new') === 'new')
  const bugunZiyaret = (web?.ziyaretler || []).filter((v: any) => (v.visited_at || '').startsWith(bugun)).length
  const ziyaret14 = useMemo(() => Array.from({ length: 14 }, (_, i) => { const t = new Date(); t.setDate(t.getDate() - (13 - i)); const k = iso(t); return { l: `${k.slice(8)}.${k.slice(5, 7)}`, v: (web?.ziyaretler || []).filter((x: any) => (x.visited_at || '').startsWith(k)).length } }), [web])
  const uretim14 = useMemo(() => Array.from({ length: 14 }, (_, i) => { const t = new Date(); t.setDate(t.getDate() - (13 - i)); const k = iso(t); const h = g('hareketler').filter((x: any) => (x.tarih || '').startsWith(k)); return { l: `${k.slice(8)}.${k.slice(5, 7)}`, u: sum(h, (x: any) => x.uretilen_adet), f: sum(h, (x: any) => x.fire_adet) } }), [d]) // eslint-disable-line

  const alerts: Alert[] = []
  if (F) {
    if (F.gecikmis.length) alerts.push({ tone: 'red', text: `${F.gecikmis.length} faturanın vadesi geçmiş (${fmtK(sum(F.gecikmis, kalanTutar))})`, href: '/admin/dashboard/muhasebe/faturalar', mod: 'muhasebe' })
    if (F.cekGecik.length) alerts.push({ tone: 'red', text: `${F.cekGecik.length} çek/senetin vadesi geçmiş, portföyde`, href: '/admin/dashboard/muhasebe/cek-senet', mod: 'muhasebe' })
    if (F.karsiliksiz.length) alerts.push({ tone: 'red', text: `${F.karsiliksiz.length} karşılıksız çek/senet kaydı var`, href: '/admin/dashboard/muhasebe/cek-senet', mod: 'muhasebe' })
    F.negatif.forEach((k: any) => alerts.push({ tone: 'red', text: `${k.ad} hesabı eksi bakiyede (${fmt(k.bakiye)})`, href: '/admin/dashboard/muhasebe/kasa-banka', mod: 'muhasebe' }))
    if (F.taslak) alerts.push({ tone: 'blue', text: `${F.taslak} taslak fatura onay bekliyor`, href: '/admin/dashboard/muhasebe/faturalar', mod: 'muhasebe' })
  }
  if (A.stok && kritik.length) alerts.push({ tone: 'red', text: `${kritik.length} hammadde kritik seviyede: ${kritik.slice(0, 3).map((h: any) => h.ad).join(', ')}${kritik.length > 3 ? '…' : ''}`, href: '/admin/dashboard/stok/hammadde', mod: 'stok' })
  if (A.satis && gecS.length) alerts.push({ tone: 'red', text: `${gecS.length} satış siparişinin termini geçmiş`, href: '/admin/dashboard/satis/siparisler', mod: 'satis' })
  if (A.satis && hazirBekleyen.length) alerts.push({ tone: 'amber', text: `${hazirBekleyen.length} sipariş hazır, sevk bekliyor`, href: '/admin/dashboard/sevkiyat', mod: 'sevkiyat' })
  if (A.uretim && arizaMakine.length) alerts.push({ tone: 'red', text: `${arizaMakine.length} makine arızalı: ${arizaMakine.map((m: any) => m.ad).join(', ')}`, href: '/admin/dashboard/uretim/makine', mod: 'uretim' })
  if (A.uretim && bakimKalip.length) alerts.push({ tone: 'amber', text: `${bakimKalip.length} kalıbın bakımı yaklaşıyor/geçmiş`, href: '/admin/dashboard/uretim/kalip', mod: 'uretim' })
  if (A.uretim && gecEmir.length) alerts.push({ tone: 'amber', text: `${gecEmir.length} üretim emri sipariş terminini aşmış durumda`, href: '/admin/dashboard/uretim/emirler', mod: 'uretim' })
  if (A.satin && gecSatin.length) alerts.push({ tone: 'amber', text: `${gecSatin.length} satınalma siparişinin teslimi gecikti`, href: '/admin/dashboard/satinalma/siparisler', mod: 'satinalma' })
  if (A.kalite && kontrolBekleyen.length) alerts.push({ tone: 'amber', text: `${kontrolBekleyen.length} tamamlanan emrin son kalite kontrolü girilmemiş`, href: '/admin/dashboard/kalite/kontrol', mod: 'kalite' })
  if (A.web && yeniBasvuru.length) alerts.push({ tone: 'blue', text: `${yeniBasvuru.length} yeni başvuru yanıt bekliyor`, href: '/admin/dashboard/basvurular', mod: 'dashboard' })
  alerts.sort((a, b) => ({ red: 0, amber: 1, blue: 2 }[a.tone] - { red: 0, amber: 1, blue: 2 }[b.tone]))

  // Kurulum kontrol listesi
  const adimlar = [
    { l: 'Kasa / banka hesabı ekle', ok: (fin?.kasalar.length || 0) > 0, href: '/admin/dashboard/muhasebe/kasa-banka', mod: A.fin },
    { l: 'İlk müşteri / tedarikçi carisini ekle', ok: (fin?.cariler.length || 0) > 0, href: '/admin/dashboard/muhasebe/cari', mod: A.fin },
    { l: 'Ürünlere stok varyantı ekle', ok: g('variants').length > 0, href: '/admin/dashboard/varyantlar', mod: true },
    { l: 'Hammaddeleri stok kartı olarak gir (maliyetiyle)', ok: g('hammaddeler').some((h: any) => +h.ortalama_maliyet > 0), href: '/admin/dashboard/stok/hammadde', mod: A.stok },
    { l: 'Makine ve kalıpları tanımla', ok: g('makineler').length > 0 && g('kaliplar').length > 0, href: '/admin/dashboard/uretim/makine', mod: A.uretim },
    { l: 'Ürün reçetesi (BOM) oluştur', ok: g('receteler').length > 0, href: '/admin/dashboard/uretim/recete', mod: A.uretim },
    { l: 'Fiyat listesi oluştur', ok: g('fiyatListeleri').length > 0, href: '/admin/dashboard/muhasebe/fiyat-listeleri', mod: A.fin },
  ].filter(a => a.mod)
  const tamam = adimlar.filter(a => a.ok).length

  const yukleniyor = !ready || loading || (A.fin && !fin)
  const hizli = [
    A.fin && { l: 'Yeni Fatura', href: '/admin/dashboard/muhasebe/faturalar', Icon: Receipt }, A.satis && { l: 'Yeni Sipariş', href: '/admin/dashboard/satis/siparisler', Icon: ClipboardList },
    A.uretim && { l: 'Üretim Emri', href: '/admin/dashboard/uretim/emirler', Icon: Factory }, A.stok && { l: 'Barkod Terminali', href: '/admin/dashboard/stok/barkod', Icon: ScanLine },
    A.uretim && { l: 'Canlı Üretim', href: '/admin/dashboard/uretim/canli', Icon: Activity }, A.satin && { l: 'Satınalma', href: '/admin/dashboard/satinalma/siparisler', Icon: PackageSearch },
  ].filter(Boolean) as any[]

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Dashboard" />
      <Page>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: '-.4px' }}>{saatSel}{isim ? `, ${isim}` : ''} 👋</h2>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--adm-tx3)' }}>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Alya Plastik ERP</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{hizli.map((h: any) => <Link key={h.href + h.l} href={h.href} className="adm-chip" style={{ textDecoration: 'none' }}><h.Icon size={13} />{h.l}</Link>)}</div>
        </div>

        {yukleniyor ? <KpiGrid>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="adm-kpi"><Skeleton h={10} w={80} /><Skeleton h={24} w={120} style={{ marginTop: 14 }} /></div>)}</KpiGrid> : (
          <>
            <KpiGrid min={210}>
              {A.fin && F && <>
                <Kpi label="Nakit Pozisyonu" value={fmtK(F.nakit)} Icon={Wallet} color="var(--adm-blue)" sub={`${fin.kasalar.length} hesap`} />
                <Kpi label="Bu Ay Net" value={fmtK(F.net)} Icon={Scale} color={F.net >= 0 ? 'var(--adm-green)' : 'var(--adm-red)'} delta={pctDelta(F.net, F.netOnceki)} sub={`Gelir ${fmtK(F.gelir)}`} spark={F.gelirSeri.map((v: number, i: number) => v - F.giderSeri[i])} />
                <Kpi label="Alacak / Borç" value={fmtK(F.alacak)} Icon={HandCoins} color="var(--adm-amber)" sub={`Borç ${fmtK(F.borc)}`} />
              </>}
              {A.satis && <Kpi label="Açık Sipariş" value={openS.length} Icon={ClipboardList} color="var(--adm-ac)" sub={fmtK(sum(openS, sTutar)) + ' (KDV hariç)'} />}
              {A.uretim && <Kpi label="Üretimde" value={uretimde.length} Icon={Factory} color="var(--adm-blue)" sub={`bugün ${fmtInt(sum(bugunH, (h: any) => h.uretilen_adet))} adet`} />}
              {A.stok && <Kpi label="Kritik Stok" value={kritik.length} Icon={Boxes} color={kritik.length ? 'var(--adm-red)' : 'var(--adm-green)'} sub={kritik.length ? 'hammadde min. altında' : 'Sorun yok'} />}
              {A.web && web && <Kpi label="Yeni Başvuru" value={yeniBasvuru.length} Icon={MessageSquare} color="var(--adm-green)" sub={`bugün ${bugunZiyaret} ziyaret`} />}
            </KpiGrid>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title={<><AlertTriangle size={14} style={{ color: alerts.some(a => a.tone === 'red') ? 'var(--adm-red)' : 'var(--adm-amber)' }} />Dikkat Gerektirenler {alerts.length ? `(${alerts.length})` : ''}</>}>
                {alerts.length === 0 ? <Empty icon={<CheckCircle2 size={28} style={{ color: 'var(--adm-green)' }} />} title="Dikkat gerektiren bir durum yok" sub="Tüm göstergeler normal" /> : alerts.slice(0, 9).map((a, i) => (
                  <Link key={i} href={a.href} className="adm-row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 18px' }}>
                    <Badge tone={a.tone}>{a.tone === 'red' ? 'Acil' : a.tone === 'amber' ? 'Yakın' : 'Bilgi'}</Badge><span style={{ flex: 1, fontSize: 13 }}>{a.text}</span><ChevronRight size={14} style={{ color: 'var(--adm-tx3)' }} />
                  </Link>))}
              </Card>

              {tamam < adimlar.length ? (
                <Card title={<><Sparkles size={14} style={{ color: 'var(--adm-ac)' }} />Kurulum Kontrol Listesi</>} right={<span style={{ fontSize: 12, fontWeight: 700 }}>{tamam}/{adimlar.length}</span>}>
                  <div style={{ padding: '4px 18px 0' }}><div style={{ height: 6, borderRadius: 4, background: 'var(--adm-s2)', overflow: 'hidden' }}><div style={{ width: `${(tamam / Math.max(adimlar.length, 1)) * 100}%`, height: '100%', background: 'var(--adm-ac)', transition: 'width .5s' }} /></div></div>
                  {adimlar.map(a => (
                    <Link key={a.l} href={a.href} className="adm-row" style={{ textDecoration: 'none', color: 'inherit', padding: '9px 18px', opacity: a.ok ? 0.55 : 1 }}>
                      {a.ok ? <CheckCircle2 size={16} style={{ color: 'var(--adm-green)' }} /> : <Circle size={16} style={{ color: 'var(--adm-tx3)' }} />}
                      <span style={{ flex: 1, fontSize: 13, textDecoration: a.ok ? 'line-through' : 'none' }}>{a.l}</span>{!a.ok && <ArrowRight size={14} style={{ color: 'var(--adm-ac)' }} />}
                    </Link>))}
                </Card>
              ) : A.uretim ? (
                <Card title={<><Activity size={14} />Hatta Çalışan Emirler</>} right={<Link href="/admin/dashboard/uretim/canli" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Canlı →</Link>}>
                  {uretimde.length === 0 ? <Empty title="Şu anda hatta emir yok" /> : uretimde.slice(0, 6).map((e: any) => (
                    <div key={e.id} className="adm-row" style={{ padding: '10px 18px' }}><div style={{ flex: 1, minWidth: 0 }}><b style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12.5 }}>{e.no}</b><div style={{ fontSize: 11.5, color: 'var(--adm-tx3)' }}>{urun[e.urun_id]?.name}</div></div>
                      <div style={{ width: 90 }}><div style={{ height: 5, borderRadius: 3, background: 'var(--adm-s2)', overflow: 'hidden' }}><div style={{ width: `${Math.min((+e.uretilen_miktar / (+e.planlanan_miktar || 1)) * 100, 100)}%`, height: '100%', background: 'var(--adm-blue)' }} /></div><div style={{ fontSize: 10.5, color: 'var(--adm-tx3)', textAlign: 'right' }}>%{fmtN((+e.uretilen_miktar / (+e.planlanan_miktar || 1)) * 100, 0)}</div></div></div>))}
                </Card>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16, marginBottom: 16 }}>
              {A.fin && F && <Card title="Gelir / Gider — Son 12 Ay" right={<Link href="/admin/dashboard/muhasebe/raporlar" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Raporlar →</Link>} pad={16}><TrendChart type="bar" height={200} labels={F.aylar.map((a: any) => a.label)} series={[{ name: 'Gelir', color: '#14b088', data: F.gelirSeri }, { name: 'Gider', color: '#e14b4b', data: F.giderSeri }]} /></Card>}
              {A.uretim && <Card title="Üretim — Son 14 Gün" right={<Link href="/admin/dashboard/uretim/emirler" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Emirler →</Link>} pad={16}><TrendChart type="bar" height={200} labels={uretim14.map(x => x.l)} series={[{ name: 'Üretilen', color: '#2f7dd6', data: uretim14.map(x => x.u) }, { name: 'Fire', color: '#e14b4b', data: uretim14.map(x => x.f) }]} format={n => fmtInt(n)} /></Card>}
              {A.web && web && <Card title="Site Ziyareti — Son 14 Gün" right={<Link href="/admin/dashboard/analytics" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Analitik →</Link>} pad={16}>
                {web.ziyaretler.length === 0 ? <Empty icon={<Eye size={28} />} title="Henüz ziyaret verisi yok" sub="Site ziyaretleri artık otomatik kaydediliyor" /> : <TrendChart type="area" height={200} labels={ziyaret14.map(x => x.l)} series={[{ name: 'Ziyaret', color: '#8b5cf6', data: ziyaret14.map(x => x.v) }]} format={n => fmtInt(n)} />}</Card>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 16 }}>
              {A.fin && F && <Card title="Yaklaşan Vadeler" right={<Link href="/admin/dashboard/muhasebe/genel" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Finans →</Link>}>
                {F.vadeler.length === 0 ? <Empty title="Yaklaşan vade yok" /> : F.vadeler.map((v: any, i: number) => { const gg = daysBetween(v.tarih, new Date()); return (
                  <div key={i} className="adm-row" style={{ padding: '9px 18px' }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{v.t}</div><div style={{ fontSize: 11, color: gg > 0 ? 'var(--adm-red)' : 'var(--adm-tx3)' }}>{v.cari ? `${v.cari} · ` : ''}{fmtDate(v.tarih)}{gg > 0 ? ` · ${gg} gün gecikmiş` : ''}</div></div><Money v={v.tutar} tone={v.giris ? 'green' : 'red'} size={12.5} /></div>) })}
              </Card>}
              {A.satis && <Card title="Açık Siparişler (termine göre)" right={<Link href="/admin/dashboard/satis/siparisler" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Tümü →</Link>}>
                {openS.length === 0 ? <Empty title="Açık sipariş yok" /> : [...openS].sort((a: any, b: any) => (a.teslim_tarihi || '9999').localeCompare(b.teslim_tarihi || '9999')).slice(0, 6).map((s: any) => (
                  <div key={s.id} className="adm-row" style={{ padding: '9px 18px' }}><div style={{ flex: 1, minWidth: 0 }}><b style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12.5 }}>{s.no}</b><div style={{ fontSize: 11, color: s.teslim_tarihi && s.teslim_tarihi < bugun ? 'var(--adm-red)' : 'var(--adm-tx3)' }}>{cari[s.cari_id]?.ad || '—'}{s.teslim_tarihi ? ` · ${fmtDate(s.teslim_tarihi)}` : ''}</div></div><Money v={sTutar(s)} size={12.5} /></div>))}
              </Card>}
              {A.web && web && <Card title="Son Başvurular" right={<Link href="/admin/dashboard/basvurular" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Tümü →</Link>}>
                {web.basvurular.length === 0 ? <Empty icon={<MessageSquare size={28} />} title="Başvuru yok" /> : web.basvurular.slice(0, 6).map((b: any) => (
                  <Link key={b.id} href="/admin/dashboard/basvurular" className="adm-row" style={{ textDecoration: 'none', color: 'inherit', padding: '9px 18px' }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{b.name}</div><div style={{ fontSize: 11, color: 'var(--adm-tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subject || b.email}</div></div><Badge tone={(b.status || 'new') === 'new' ? 'ac' : (b.status === 'replied' ? 'green' : 'muted')}>{{ new: 'Yeni', read: 'Okundu', replied: 'Yanıtlandı', archived: 'Arşiv' }[(b.status || 'new') as string]}</Badge></Link>))}
              </Card>}
            </div>
          </>
        )}
      </Page>
    </div>
  )
}
