'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { fmt, fmtK, fmtDate, daysBetween, fmtPct } from '@/lib/fmt'
import {
  DONEMLER, donemAralik, inRange, sonAylar, ayAnahtar, sum, pctDelta, isPnl, kalanTutar, acikFatura, agingBuckets, CHART_COLORS, type Donem,
} from '@/lib/muh-utils'
import { Page, PageHead, Kpi, KpiGrid, Card, Tabs, Badge, Money, Empty, Skeleton } from '@/components/admin/erp/ui'
import { TrendChart, Donut, BarList, StackBar } from '@/components/admin/erp/charts'
import {
  TrendingUp, TrendingDown, Scale, Wallet, HandCoins, Landmark as Bank, AlertTriangle, CalendarClock, RefreshCw, ArrowUpRight, ArrowDownRight,
  Receipt, FileSignature, Users2, CheckCircle2, ChevronRight,
} from 'lucide-react'

export default function MuhasebeGenelPage() {
  const [donem, setDonem] = useState<Donem>('bu_ay')
  const [grafik, setGrafik] = useState<'aylik' | 'net'>('aylik')
  const [loading, setLoading] = useState(true)
  const [islemler, setIslemler] = useState<any[]>([])
  const [faturalar, setFaturalar] = useState<any[]>([])
  const [cariler, setCariler] = useState<any[]>([])
  const [kasalar, setKasalar] = useState<any[]>([])
  const [cekler, setCekler] = useState<any[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const [i, f, c, k, cs] = await Promise.all([
      muh.all('islemler', '*', q => q.order('tarih', { ascending: false })),
      muh.all('faturalar', '*', q => q.order('tarih', { ascending: false })),
      muh.all('cari_hesaplar', 'id,ad,tip,bakiye'),
      muh.all('kasa_banka_hesaplari', '*'),
      muh.all('cek_senet', '*'),
    ])
    setIslemler(i); setFaturalar(f); setCariler(c); setKasalar(k); setCekler(cs); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const R = useMemo(() => donemAralik(donem), [donem])
  const pnl = useMemo(() => islemler.filter(isPnl), [islemler])
  const cariAd = useMemo(() => Object.fromEntries(cariler.map(c => [c.id, c.ad])), [cariler])

  const cur = pnl.filter(i => inRange(i.tarih, R.from, R.to))
  const prev = R.pFrom ? pnl.filter(i => inRange(i.tarih, R.pFrom, R.pTo)) : []
  const gelir = sum(cur.filter(i => i.tip === 'gelir'), i => i.tutar)
  const gider = sum(cur.filter(i => i.tip === 'gider'), i => i.tutar)
  const pGelir = sum(prev.filter(i => i.tip === 'gelir'), i => i.tutar)
  const pGider = sum(prev.filter(i => i.tip === 'gider'), i => i.tutar)
  const net = gelir - gider, pNet = pGelir - pGider
  const marj = gelir ? (net / gelir) * 100 : 0

  const aylar = useMemo(() => sonAylar(12), [])
  const aylik = useMemo(() => aylar.map(a => {
    const m = pnl.filter(i => i.tarih && ayAnahtar(i.tarih) === a.key)
    return { gelir: sum(m.filter(i => i.tip === 'gelir'), i => i.tutar), gider: sum(m.filter(i => i.tip === 'gider'), i => i.tutar) }
  }), [pnl, aylar])

  const nakit = sum(kasalar.filter(k => k.aktif !== false), k => k.bakiye)
  const alacak = sum(cariler.filter(c => +c.bakiye > 0), c => c.bakiye)
  const borc = sum(cariler.filter(c => +c.bakiye < 0), c => -c.bakiye)

  const acik = faturalar.filter(acikFatura)
  const bugun = new Date().toISOString().split('T')[0]
  const gecikmis = acik.filter(f => f.tip !== 'iade' && (f.vade || f.tarih) < bugun && f.vade)
  const alacakFat = acik.filter(f => f.tip === 'satis')
  const borcFat = acik.filter(f => f.tip === 'alis')
  const aging = agingBuckets(alacakFat)
  const taslak = faturalar.filter(f => f.durum === 'taslak').length

  const portfoy = cekler.filter(c => c.durum === 'portfoyde')
  const cek7 = portfoy.filter(c => { const d = daysBetween(bugun, c.vade_tarihi); return d >= 0 && d <= 7 })
  const cekGecik = portfoy.filter(c => c.vade_tarihi < bugun)
  const karsiliksiz = cekler.filter(c => c.durum === 'karsiliksiz')

  // Yaklaşan / geciken vadeler (fatura + çek/senet), 30 gün ileri
  const vadeler = useMemo(() => {
    const l: any[] = []
    acik.filter(f => f.vade && f.tip !== 'iade').forEach(f => l.push({ t: 'fatura', tarih: f.vade, ad: `${f.tip === 'satis' ? 'Tahsilat' : 'Ödeme'} · ${f.no}`, cari: cariAd[f.cari_id], tutar: kalanTutar(f), giris: f.tip === 'satis' }))
    portfoy.forEach(c => l.push({ t: 'cek', tarih: c.vade_tarihi, ad: `${c.tip === 'cek' ? 'Çek' : 'Senet'} ${c.no || ''}`, cari: cariAd[c.cari_id], tutar: +c.tutar, giris: c.yon === 'alinan' }))
    const lim = new Date(); lim.setDate(lim.getDate() + 30)
    return l.filter(v => v.tarih <= lim.toISOString().split('T')[0]).sort((a, b) => a.tarih.localeCompare(b.tarih)).slice(0, 8)
  }, [acik, portfoy, cariAd])

  const giderKat = useMemo(() => {
    const m: Record<string, number> = {}
    cur.filter(i => i.tip === 'gider').forEach(i => { m[i.kategori || 'Diğer'] = (m[i.kategori || 'Diğer'] || 0) + (+i.tutar || 0) })
    const e = Object.entries(m).sort((a, b) => b[1] - a[1])
    const top = e.slice(0, 5).map(([label, value], i) => ({ label, value, color: CHART_COLORS[i] }))
    const rest = sum(e.slice(5), x => x[1]); if (rest > 0) top.push({ label: 'Diğer', value: rest, color: '#94a3b8' })
    return top
  }, [cur])
  const gelirKat = useMemo(() => {
    const m: Record<string, number> = {}
    cur.filter(i => i.tip === 'gelir').forEach(i => { m[i.kategori || 'Diğer'] = (m[i.kategori || 'Diğer'] || 0) + (+i.tutar || 0) })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value, color: 'var(--adm-green)' }))
  }, [cur])

  const topAlacak = [...cariler].filter(c => +c.bakiye > 0).sort((a, b) => b.bakiye - a.bakiye).slice(0, 5)
  const topBorc = [...cariler].filter(c => +c.bakiye < 0).sort((a, b) => a.bakiye - b.bakiye).slice(0, 5)
  const son = islemler.slice(0, 7)

  // Uyarılar
  const uyarilar: { tone: 'red' | 'amber' | 'blue'; text: string; href: string }[] = []
  if (gecikmis.length) uyarilar.push({ tone: 'red', text: `${gecikmis.length} faturanın vadesi geçmiş (${fmtK(sum(gecikmis, kalanTutar))})`, href: '/admin/dashboard/muhasebe/faturalar' })
  if (cekGecik.length) uyarilar.push({ tone: 'red', text: `${cekGecik.length} çek/senetin vadesi geçmiş, portföyde bekliyor`, href: '/admin/dashboard/muhasebe/cek-senet' })
  if (karsiliksiz.length) uyarilar.push({ tone: 'red', text: `${karsiliksiz.length} karşılıksız çek/senet kaydı var`, href: '/admin/dashboard/muhasebe/cek-senet' })
  if (cek7.length) uyarilar.push({ tone: 'amber', text: `${cek7.length} çek/senet 7 gün içinde vadesi doluyor (${fmtK(sum(cek7, c => c.tutar))})`, href: '/admin/dashboard/muhasebe/cek-senet' })
  kasalar.filter(k => +k.bakiye < 0).forEach(k => uyarilar.push({ tone: 'red', text: `${k.ad} hesabı eksi bakiyede (${fmt(k.bakiye)})`, href: '/admin/dashboard/muhasebe/kasa-banka' }))
  if (taslak) uyarilar.push({ tone: 'blue', text: `${taslak} taslak fatura onay bekliyor`, href: '/admin/dashboard/muhasebe/faturalar' })
  if (islemler.some(i => !i.kasa_hesap_id && i.kategori !== 'Fatura Kapama')) {
    const n = islemler.filter(i => !i.kasa_hesap_id && i.kategori !== 'Fatura Kapama').length
    uyarilar.push({ tone: 'blue', text: `${n} işlem kasa/banka hesabına bağlı değil — bakiyeleri etkilemiyor`, href: '/admin/dashboard/muhasebe/islemler' })
  }

  const donemLabel = donem === 'tumu' ? 'Tüm zamanlar' : donem === 'bu_ay' ? 'Bu ay' : donem === 'gecen_ay' ? 'Geçen ay' : donem === '3ay' ? 'Son 3 ay' : 'Bu yıl'
  const cmp = donem === 'tumu' ? undefined : 'önceki döneme göre'

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Muhasebe — Genel Bakış" />
      <Page>
        <PageHead title="Finansal Durum" sub={`Nakit bazlı özet · ${donemLabel}${R.from ? ` (${fmtDate(R.from)} – ${fmtDate(R.to)})` : ''}`}
          actions={<>
            <Tabs tabs={DONEMLER.map(d => ({ v: d.v, l: d.l }))} value={donem} onChange={v => setDonem(v as Donem)} />
            <button className="adm-btn-ghost" onClick={load} title="Yenile"><RefreshCw size={14} style={loading ? { animation: 'admSpin 1s linear infinite' } : undefined} /></button>
          </>} />

        {loading ? <KpiGrid>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="adm-kpi"><Skeleton h={10} w={80} /><Skeleton h={24} w={120} style={{ marginTop: 14 }} /></div>)}</KpiGrid> : (
          <>
            <KpiGrid min={210}>
              <Kpi label="Gelir" value={fmtK(gelir)} Icon={TrendingUp} color="var(--adm-green)" delta={cmp ? pctDelta(gelir, pGelir) : null} sub={cmp} spark={aylik.map(a => a.gelir)} />
              <Kpi label="Gider" value={fmtK(gider)} Icon={TrendingDown} color="var(--adm-red)" delta={cmp ? -pctDelta(gider, pGider) : null} sub={cmp} spark={aylik.map(a => a.gider)} />
              <Kpi label="Net Kâr / Zarar" value={fmtK(net)} Icon={Scale} color={net >= 0 ? 'var(--adm-green)' : 'var(--adm-red)'} delta={cmp ? pctDelta(net, pNet) : null} sub={`Marj ${fmtPct(marj)}`} />
              <Kpi label="Nakit Pozisyonu" value={fmtK(nakit)} Icon={Wallet} color="var(--adm-blue)" sub={`${kasalar.filter(k => k.aktif !== false).length} kasa/banka hesabı`} />
              <Kpi label="Toplam Alacak" value={fmtK(alacak)} Icon={HandCoins} color="var(--adm-amber)" sub={`${cariler.filter(c => +c.bakiye > 0).length} müşteri/cari`} />
              <Kpi label="Toplam Borç" value={fmtK(borc)} Icon={Receipt} color="#8b5cf6" sub={`${cariler.filter(c => +c.bakiye < 0).length} tedarikçi/cari`} />
            </KpiGrid>

            {/* Uyarılar */}
            <div style={{ marginBottom: 16 }}>
              {uyarilar.length === 0 ? (
                <div className="adm-card" style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--adm-green)' }}><CheckCircle2 size={16} />Dikkat gerektiren bir durum yok.</div>
              ) : (
                <div className="adm-card">
                  <div className="adm-card-h"><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle size={14} style={{ color: 'var(--adm-amber)' }} />Dikkat Gerektirenler ({uyarilar.length})</span></div>
                  {uyarilar.map((u, i) => (
                    <Link key={i} href={u.href} className="adm-row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 20px' }}>
                      <Badge tone={u.tone}>{u.tone === 'red' ? 'Acil' : u.tone === 'amber' ? 'Yakın' : 'Bilgi'}</Badge>
                      <span style={{ flex: 1, fontSize: 13 }}>{u.text}</span><ChevronRight size={14} style={{ color: 'var(--adm-tx3)' }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title="Son 12 Ay" right={<Tabs tabs={[{ v: 'aylik', l: 'Gelir / Gider' }, { v: 'net', l: 'Net' }]} value={grafik} onChange={v => setGrafik(v as any)} style={{ padding: 3 }} />} pad={16}>
                {grafik === 'aylik'
                  ? <TrendChart type="bar" labels={aylar.map(a => a.label)} series={[{ name: 'Gelir', color: '#14b088', data: aylik.map(a => a.gelir) }, { name: 'Gider', color: '#e14b4b', data: aylik.map(a => a.gider) }]} />
                  : <TrendChart type="area" allowNegative labels={aylar.map(a => a.label)} series={[{ name: 'Net', color: '#2f7dd6', data: aylik.map(a => a.gelir - a.gider) }]} />}
              </Card>
              <Card title="Alacak Yaşlandırma" right={<Link href="/admin/dashboard/muhasebe/raporlar" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Detaylı rapor →</Link>} pad={18}>
                {sum(aging, a => a.value) === 0
                  ? <Empty icon={<CheckCircle2 size={28} />} title="Açık alacak faturası yok" sub="Onaylanmış, tahsil edilmemiş satış faturası bulunmuyor" />
                  : <>
                    <StackBar parts={aging} />
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--adm-bdr)', display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span style={{ color: 'var(--adm-tx3)' }}>Toplam açık alacak faturası</span><b>{fmt(sum(alacakFat, kalanTutar))}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 6 }}>
                      <span style={{ color: 'var(--adm-tx3)' }}>Ödenecek tedarikçi faturası</span><b>{fmt(sum(borcFat, kalanTutar))}</b>
                    </div>
                  </>}
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title="Gider Dağılımı" pad={18}>
                {giderKat.length === 0 ? <Empty title="Bu dönemde gider yok" /> : <Donut data={giderKat} center={{ top: 'Toplam', bottom: fmtK(gider) }} />}
              </Card>
              <Card title="Gelir Kaynakları" pad={18}>
                {gelirKat.length === 0 ? <Empty title="Bu dönemde gelir yok" /> : <BarList items={gelirKat} />}
              </Card>
              <Card title={<><CalendarClock size={14} />Yaklaşan Vadeler (30 gün)</>}>
                {vadeler.length === 0 ? <Empty title="Yaklaşan vade yok" /> : vadeler.map((v, i) => {
                  const g = daysBetween(v.tarih, new Date())
                  return (
                    <div key={i} className="adm-row" style={{ padding: '10px 16px' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: v.giris ? 'var(--adm-green2)' : 'var(--adm-red2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.t === 'cek' ? <FileSignature size={14} style={{ color: v.giris ? 'var(--adm-green)' : 'var(--adm-red)' }} /> : <Receipt size={14} style={{ color: v.giris ? 'var(--adm-green)' : 'var(--adm-red)' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.ad}</div>
                        <div style={{ fontSize: 11, color: g > 0 ? 'var(--adm-red)' : 'var(--adm-tx3)' }}>{v.cari || '—'} · {fmtDate(v.tarih)}{g > 0 ? ` · ${g} gün gecikmiş` : g === 0 ? ' · bugün' : ''}</div>
                      </div>
                      <Money v={v.tutar} tone={v.giris ? 'green' : 'red'} size={12.5} />
                    </div>
                  )
                })}
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title={<><Bank size={14} />Kasa / Banka</>} right={<Link href="/admin/dashboard/muhasebe/kasa-banka" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Yönet →</Link>}>
                {kasalar.length === 0 ? <Empty title="Hesap tanımlı değil" sub="Kasa/Banka sayfasından hesap ekle" /> : kasalar.map(k => (
                  <div key={k.id} className="adm-row" style={{ padding: '10px 16px' }}>
                    <Badge tone={k.tip === 'banka' ? 'blue' : 'amber'}>{k.tip === 'banka' ? 'Banka' : 'Kasa'}</Badge>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{k.ad}</span><Money v={+k.bakiye} tone="auto" size={12.5} />
                  </div>
                ))}
              </Card>
              <Card title={<><Users2 size={14} />En Yüksek Bakiyeler</>} right={<Link href="/admin/dashboard/muhasebe/cari" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Cariler →</Link>}>
                {topAlacak.length + topBorc.length === 0 ? <Empty title="Açık bakiye yok" /> : (
                  <>
                    {topAlacak.map(c => <div key={c.id} className="adm-row" style={{ padding: '9px 16px' }}><span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{c.ad}</span><Badge tone="green">Alacak</Badge><Money v={+c.bakiye} tone="green" size={12.5} /></div>)}
                    {topBorc.map(c => <div key={c.id} className="adm-row" style={{ padding: '9px 16px' }}><span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{c.ad}</span><Badge tone="red">Borç</Badge><Money v={-c.bakiye} tone="red" size={12.5} /></div>)}
                  </>
                )}
              </Card>
              <Card title="Son İşlemler" right={<Link href="/admin/dashboard/muhasebe/islemler" style={{ fontSize: 12, color: 'var(--adm-ac)' }}>Tümü →</Link>}>
                {son.length === 0 ? <Empty title="Henüz işlem yok" /> : son.map(i => (
                  <div key={i.id} className="adm-row" style={{ padding: '9px 16px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: i.tip === 'gelir' ? 'var(--adm-green2)' : 'var(--adm-red2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i.tip === 'gelir' ? <ArrowUpRight size={14} style={{ color: 'var(--adm-green)' }} /> : <ArrowDownRight size={14} style={{ color: 'var(--adm-red)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.aciklama || i.kategori}</div>
                      <div style={{ fontSize: 11, color: 'var(--adm-tx3)' }}>{i.kategori} · {fmtDate(i.tarih)}</div>
                    </div>
                    <Money v={+i.tutar} tone={i.tip === 'gelir' ? 'green' : 'red'} sign={i.tip === 'gelir'} size={12.5} />
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}
      </Page>
    </div>
  )
}
