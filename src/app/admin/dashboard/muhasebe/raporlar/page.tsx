'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { fmt, fmtK, fmtDate, fmtPct, csvDownload, todayISO } from '@/lib/fmt'
import { DONEMLER, donemAralik, inRange, sum, isPnl, pctDelta, sonAylar, ayAnahtar, kalanTutar, acikFatura, agingKova, AGING, CHART_COLORS, type Donem } from '@/lib/muh-utils'
import { Page, PageHead, Kpi, KpiGrid, Card, Tabs, Money, Badge, Empty, Skeleton } from '@/components/admin/erp/ui'
import { TrendChart, Donut, BarList, StackBar } from '@/components/admin/erp/charts'
import { Download, Printer, Scale, TrendingUp, TrendingDown, Percent, Receipt, Users2, Wallet, BarChart3 } from 'lucide-react'

type DonemO = Donem | 'ozel'

function yazdirTablo(baslik: string, sub: string, basliklar: string[], satirlar: (string | number)[][]) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${baslik}</title><style>
    body{font-family:Arial,sans-serif;color:#0b0e0b;padding:36px;max-width:900px;margin:0 auto}h1{font-size:19px;margin:0}.muted{color:#6b7366;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:7px 6px;font-size:12.5px;border-bottom:1px solid #ddd;text-align:left}th{color:#6b7366;font-size:10.5px;text-transform:uppercase}
    td:not(:first-child),th:not(:first-child){text-align:right}.header{border-bottom:2px solid #e55f28;padding-bottom:12px;margin-bottom:8px}@media print{body{padding:0}}</style></head><body>
    <div class="header"><h1>ALYA PLASTİK — ${baslik}</h1><p class="muted">${sub} · ${new Date().toLocaleDateString('tr-TR')}</p></div>
    <table><thead><tr>${basliklar.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${satirlar.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`
  const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 300) }
}

export default function RaporlarPage() {
  const [rapor, setRapor] = useState('kz')
  const [donem, setDonem] = useState<DonemO>('yil')
  const [ozel, setOzel] = useState({ from: todayISO().slice(0, 8) + '01', to: todayISO() })
  const [loading, setLoading] = useState(true)
  const [islemler, setIslemler] = useState<any[]>([])
  const [faturalar, setFaturalar] = useState<any[]>([])
  const [kalemler, setKalemler] = useState<any[]>([])
  const [cariler, setCariler] = useState<any[]>([])
  const [kasalar, setKasalar] = useState<any[]>([])

  const load = useCallback(async () => {
    const [i, f, k, c, h] = await Promise.all([
      muh.all('islemler', '*'), muh.all('faturalar', '*'), muh.all('fatura_kalemleri', 'fatura_id,urun_adi,miktar,birim,birim_fiyat,kdv_orani,toplam'),
      muh.all('cari_hesaplar', 'id,ad,tip,bakiye'), muh.all('kasa_banka_hesaplari', '*'),
    ])
    setIslemler(i); setFaturalar(f); setKalemler(k); setCariler(c); setKasalar(h); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const R = useMemo(() => {
    if (donem !== 'ozel') return donemAralik(donem)
    const gun = Math.max(1, Math.round((+new Date(ozel.to) - +new Date(ozel.from)) / 86400000) + 1)
    const pTo = new Date(new Date(ozel.from).getTime() - 86400000), pFrom = new Date(pTo.getTime() - (gun - 1) * 86400000)
    return { from: ozel.from, to: ozel.to, pFrom: pFrom.toISOString().slice(0, 10), pTo: pTo.toISOString().slice(0, 10) }
  }, [donem, ozel])
  const label = donem === 'ozel' ? `${fmtDate(R.from)} – ${fmtDate(R.to)}` : DONEMLER.find(d => d.v === donem)?.l
  const cariAd = useMemo(() => Object.fromEntries(cariler.map(c => [c.id, c.ad])), [cariler])

  /* ───── Kâr / Zarar ───── */
  const pnl = islemler.filter(isPnl)
  const cur = pnl.filter(i => inRange(i.tarih, R.from, R.to)), prev = R.pFrom ? pnl.filter(i => inRange(i.tarih, R.pFrom, R.pTo)) : []
  const gelir = sum(cur.filter(i => i.tip === 'gelir'), i => i.tutar), gider = sum(cur.filter(i => i.tip === 'gider'), i => i.tutar)
  const pGelir = sum(prev.filter(i => i.tip === 'gelir'), i => i.tutar), pGider = sum(prev.filter(i => i.tip === 'gider'), i => i.tutar)
  const kategoriTablo = (tip: string) => {
    const m: Record<string, { c: number; p: number }> = {}
    cur.filter(i => i.tip === tip).forEach(i => { (m[i.kategori || 'Diğer'] ||= { c: 0, p: 0 }).c += +i.tutar || 0 })
    prev.filter(i => i.tip === tip).forEach(i => { (m[i.kategori || 'Diğer'] ||= { c: 0, p: 0 }).p += +i.tutar || 0 })
    return Object.entries(m).sort((a, b) => b[1].c - a[1].c)
  }
  const gelirKat = kategoriTablo('gelir'), giderKat = kategoriTablo('gider')
  const kurFarki = sum(islemler.filter(i => inRange(i.tarih, R.from, R.to) && i.kategori === 'Kur Farkı Geliri'), i => i.tutar) - sum(islemler.filter(i => inRange(i.tarih, R.from, R.to) && i.kategori === 'Kur Farkı Gideri'), i => i.tutar)

  /* ───── Aylık seri ───── */
  const aylar = useMemo(() => sonAylar(12), [])
  const aylik = aylar.map(a => { const m = pnl.filter(i => i.tarih && ayAnahtar(i.tarih) === a.key); return { gelir: sum(m.filter(i => i.tip === 'gelir'), i => i.tutar), gider: sum(m.filter(i => i.tip === 'gider'), i => i.tutar) } })

  /* ───── KDV ───── */
  const fatDonem = faturalar.filter(f => ['onaylandi', 'odendi'].includes(f.durum) && inRange(f.tarih, R.from, R.to))
  const kdvHes = sum(fatDonem.filter(f => f.tip === 'satis'), f => f.kdv_tutari) - sum(fatDonem.filter(f => f.tip === 'iade'), f => f.kdv_tutari)
  const kdvInd = sum(fatDonem.filter(f => f.tip === 'alis'), f => f.kdv_tutari)
  const kdvOran = useMemo(() => {
    const ids = new Map(fatDonem.map(f => [f.id, f.tip]))
    const m: Record<string, { h: number; i: number; matrah: number }> = {}
    kalemler.forEach(k => { const t = ids.get(k.fatura_id); if (!t || t === 'iade') return; const o = `%${k.kdv_orani}`; const b = (+k.miktar || 0) * (+k.birim_fiyat || 0); const kdv = (b * (+k.kdv_orani || 0)) / 100; const x = (m[o] ||= { h: 0, i: 0, matrah: 0 }); if (t === 'satis') { x.h += kdv; x.matrah += b } else x.i += kdv })
    return Object.entries(m).sort()
  }, [fatDonem, kalemler])
  const kdvAylik = aylar.map(a => { const f = faturalar.filter(x => ['onaylandi', 'odendi'].includes(x.durum) && x.tarih && ayAnahtar(x.tarih) === a.key); return { h: sum(f.filter(x => x.tip === 'satis'), x => x.kdv_tutari), i: sum(f.filter(x => x.tip === 'alis'), x => x.kdv_tutari) } })

  /* ───── Yaşlandırma ───── */
  const acik = faturalar.filter(f => acikFatura(f) && f.tip !== 'iade')
  const yas = useMemo(() => {
    const m: Record<string, any> = {}
    acik.forEach(f => { if (!f.cari_id) return; const x = (m[f.cari_id] ||= { ad: cariAd[f.cari_id] || '—', alacak: { guncel: 0, d30: 0, d60: 0, d90: 0, d90p: 0 }, borc: { guncel: 0, d30: 0, d60: 0, d90: 0, d90p: 0 } }); (f.tip === 'satis' ? x.alacak : x.borc)[agingKova(f)] += kalanTutar(f) })
    return Object.values(m)
  }, [acik, cariAd])
  const yasToplam = (k: 'alacak' | 'borc') => AGING.map(a => ({ label: a.l, value: sum(yas, (x: any) => x[k][a.k]), color: a.color }))

  /* ───── Satış analizi ───── */
  const satisF = fatDonem.filter(f => f.tip === 'satis')
  const topMusteri = useMemo(() => { const m: Record<string, number> = {}; satisF.forEach(f => { m[f.cari_id || '_'] = (m[f.cari_id || '_'] || 0) + +f.toplam }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, v], i) => ({ label: cariAd[id] || 'Cari yok', value: v, color: CHART_COLORS[i % 10] })) }, [satisF, cariAd])
  const topUrun = useMemo(() => { const ids = new Set(satisF.map(f => f.id)); const m: Record<string, { t: number; q: number }> = {}; kalemler.filter(k => ids.has(k.fatura_id)).forEach(k => { const x = (m[k.urun_adi] ||= { t: 0, q: 0 }); x.t += +k.toplam || 0; x.q += +k.miktar || 0 }); return Object.entries(m).sort((a, b) => b[1].t - a[1].t).slice(0, 8).map(([label, v]) => ({ label, value: v.t, sub: `${v.q} adet` })) }, [satisF, kalemler])
  const satisAylik = aylar.map(a => sum(faturalar.filter(f => f.tip === 'satis' && ['onaylandi', 'odendi'].includes(f.durum) && f.tarih && ayAnahtar(f.tarih) === a.key), f => f.toplam))

  /* ───── Nakit akışı ───── */
  const hesapAkis = kasalar.map(h => {
    const mv = islemler.filter(i => i.kasa_hesap_id === h.id && inRange(i.tarih, R.from, R.to))
    const gir = sum(mv.filter(i => i.tip === 'gelir'), i => i.tutar), cik = sum(mv.filter(i => i.tip === 'gider'), i => i.tutar)
    return { ad: h.ad, gir, cik, net: gir - cik, kapanis: +h.bakiye, acilis: +h.bakiye - (gir - cik) }
  })
  const nakitAylik = aylar.map(a => { const m = islemler.filter(i => i.kasa_hesap_id && i.tarih && ayAnahtar(i.tarih) === a.key); return { g: sum(m.filter(i => i.tip === 'gelir'), i => i.tutar), c: sum(m.filter(i => i.tip === 'gider'), i => i.tutar) } })

  const exportKz = () => csvDownload(`kar-zarar-${todayISO()}.csv`, [...gelirKat.map(([k, v]) => ({ Tür: 'Gelir', Kategori: k, Tutar: v.c, 'Önceki dönem': v.p })), ...giderKat.map(([k, v]) => ({ Tür: 'Gider', Kategori: k, Tutar: -v.c, 'Önceki dönem': -v.p }))])

  const tabs = [{ v: 'kz', l: 'Kâr / Zarar' }, { v: 'nakit', l: 'Nakit Akışı' }, { v: 'kdv', l: 'KDV' }, { v: 'yas', l: 'Yaşlandırma' }, { v: 'satis', l: 'Satış Analizi' }]
  const delta = (c: number, p: number) => (R.pFrom ? pctDelta(c, p) : null)

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Finansal Raporlar" />
      <Page>
        <PageHead title="Raporlar" sub={`${label} · nakit bazlı · virman, kur farkı ve iç düzeltmeler kâr/zarara dahil değil`}
          actions={<>
            <Tabs tabs={[...DONEMLER.map(d => ({ v: d.v, l: d.l })), { v: 'ozel', l: 'Özel' }]} value={donem} onChange={v => setDonem(v as DonemO)} />
            {donem === 'ozel' && <><input type="date" className="adm-sel" value={ozel.from} onChange={e => setOzel(o => ({ ...o, from: e.target.value }))} /><input type="date" className="adm-sel" value={ozel.to} onChange={e => setOzel(o => ({ ...o, to: e.target.value }))} /></>}
          </>} />
        <div style={{ marginBottom: 16 }}><Tabs tabs={tabs} value={rapor} onChange={setRapor} /></div>

        {loading ? <KpiGrid>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="adm-kpi"><Skeleton h={10} w={80} /><Skeleton h={24} w={120} style={{ marginTop: 14 }} /></div>)}</KpiGrid> : <>

          {/* ══ KÂR / ZARAR ══ */}
          {rapor === 'kz' && <>
            <KpiGrid min={200}>
              <Kpi label="Gelir" value={fmtK(gelir)} Icon={TrendingUp} color="var(--adm-green)" delta={delta(gelir, pGelir)} sub={R.pFrom ? 'önceki döneme göre' : undefined} />
              <Kpi label="Gider" value={fmtK(gider)} Icon={TrendingDown} color="var(--adm-red)" delta={delta(gider, pGider) == null ? null : -delta(gider, pGider)!} sub={R.pFrom ? 'önceki döneme göre' : undefined} />
              <Kpi label="Net Kâr / Zarar" value={fmtK(gelir - gider)} Icon={Scale} color={gelir - gider >= 0 ? 'var(--adm-green)' : 'var(--adm-red)'} delta={delta(gelir - gider, pGelir - pGider)} />
              <Kpi label="Kâr Marjı" value={fmtPct(gelir ? ((gelir - gider) / gelir) * 100 : 0)} Icon={Percent} color="var(--adm-blue)" sub={kurFarki ? `Kur farkı (bilgi): ${fmtK(kurFarki)}` : undefined} />
            </KpiGrid>
            <Card title="Gelir Tablosu" right={<><button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={exportKz}><Download size={13} />CSV</button><button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={() => yazdirTablo('Gelir Tablosu', label || '', ['Kalem', 'Tutar', 'Önceki dönem', 'Değişim'], [['GELİRLER', '', '', ''], ...gelirKat.map(([k, v]) => [k, fmt(v.c), fmt(v.p), fmtPct(pctDelta(v.c, v.p))]), ['Toplam gelir', fmt(gelir), fmt(pGelir), ''], ['GİDERLER', '', '', ''], ...giderKat.map(([k, v]) => [k, fmt(v.c), fmt(v.p), fmtPct(pctDelta(v.c, v.p))]), ['Toplam gider', fmt(gider), fmt(pGider), ''], ['NET KÂR/ZARAR', fmt(gelir - gider), fmt(pGelir - pGider), '']])}><Printer size={13} />Yazdır</button></>}>
              <table className="adm-tbl">
                <thead><tr><th>Kalem</th><th style={{ textAlign: 'right' }}>Bu dönem</th><th style={{ textAlign: 'right' }}>Önceki dönem</th><th style={{ textAlign: 'right' }}>Değişim</th><th style={{ textAlign: 'right' }}>Pay</th></tr></thead>
                <tbody>
                  <tr><td colSpan={5} style={{ background: 'var(--adm-green2)', fontWeight: 700, color: 'var(--adm-green)', fontSize: 11.5, letterSpacing: '.05em' }}>GELİRLER</td></tr>
                  {gelirKat.map(([k, v]) => <tr key={k}><td style={{ paddingLeft: 24 }}>{k}</td><td style={{ textAlign: 'right' }}><Money v={v.c} bold={false} /></td><td style={{ textAlign: 'right', color: 'var(--adm-tx3)' }}>{fmt(v.p)}</td><td style={{ textAlign: 'right' }}>{R.pFrom ? <Badge tone={v.c >= v.p ? 'green' : 'red'}>{fmtPct(pctDelta(v.c, v.p))}</Badge> : '—'}</td><td style={{ textAlign: 'right', color: 'var(--adm-tx3)' }}>{fmtPct(gelir ? (v.c / gelir) * 100 : 0)}</td></tr>)}
                  <tr><td><b>Toplam Gelir</b></td><td style={{ textAlign: 'right' }}><Money v={gelir} tone="green" /></td><td style={{ textAlign: 'right' }}>{fmt(pGelir)}</td><td /><td /></tr>
                  <tr><td colSpan={5} style={{ background: 'var(--adm-red2)', fontWeight: 700, color: 'var(--adm-red)', fontSize: 11.5, letterSpacing: '.05em' }}>GİDERLER</td></tr>
                  {giderKat.map(([k, v]) => <tr key={k}><td style={{ paddingLeft: 24 }}>{k}</td><td style={{ textAlign: 'right' }}><Money v={v.c} bold={false} /></td><td style={{ textAlign: 'right', color: 'var(--adm-tx3)' }}>{fmt(v.p)}</td><td style={{ textAlign: 'right' }}>{R.pFrom ? <Badge tone={v.c <= v.p ? 'green' : 'red'}>{fmtPct(pctDelta(v.c, v.p))}</Badge> : '—'}</td><td style={{ textAlign: 'right', color: 'var(--adm-tx3)' }}>{fmtPct(gider ? (v.c / gider) * 100 : 0)}</td></tr>)}
                  <tr><td><b>Toplam Gider</b></td><td style={{ textAlign: 'right' }}><Money v={gider} tone="red" /></td><td style={{ textAlign: 'right' }}>{fmt(pGider)}</td><td /><td /></tr>
                </tbody>
                <tfoot><tr><td>NET KÂR / ZARAR</td><td style={{ textAlign: 'right' }}><Money v={gelir - gider} tone="auto" size={14} /></td><td style={{ textAlign: 'right' }}>{fmt(pGelir - pGider)}</td><td colSpan={2} /></tr></tfoot>
              </table>
              {gelirKat.length + giderKat.length === 0 && <Empty title="Bu dönemde kayıt yok" />}
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16, marginTop: 16 }}>
              <Card title="Gider Dağılımı" pad={18}>{giderKat.length === 0 ? <Empty title="Gider yok" /> : <Donut data={giderKat.slice(0, 7).map(([k, v], i) => ({ label: k, value: v.c, color: CHART_COLORS[i] }))} center={{ top: 'Toplam', bottom: fmtK(gider) }} />}</Card>
              <Card title="Aylık Net (12 ay)" pad={16}><TrendChart type="area" allowNegative labels={aylar.map(a => a.label)} series={[{ name: 'Net', color: '#2f7dd6', data: aylik.map(a => a.gelir - a.gider) }]} height={200} /></Card>
            </div>
          </>}

          {/* ══ NAKİT AKIŞI ══ */}
          {rapor === 'nakit' && <>
            <KpiGrid min={200}>
              <Kpi label="Toplam Nakit" value={fmtK(sum(kasalar.filter(k => k.aktif !== false), k => k.bakiye))} Icon={Wallet} color="var(--adm-blue)" sub={`${kasalar.length} hesap`} />
              <Kpi label="Dönem Girişi" value={fmtK(sum(hesapAkis, h => h.gir))} Icon={TrendingUp} color="var(--adm-green)" sub="virman dahil, hesaplar arası" />
              <Kpi label="Dönem Çıkışı" value={fmtK(sum(hesapAkis, h => h.cik))} Icon={TrendingDown} color="var(--adm-red)" />
              <Kpi label="Net Nakit Değişimi" value={fmtK(sum(hesapAkis, h => h.net))} Icon={Scale} color={sum(hesapAkis, h => h.net) >= 0 ? 'var(--adm-green)' : 'var(--adm-red)'} />
            </KpiGrid>
            <Card title="12 Aylık Nakit Hareketi (hesaba bağlı işlemler)" pad={16} style={{ marginBottom: 16 }}>
              <TrendChart type="bar" labels={aylar.map(a => a.label)} series={[{ name: 'Giriş', color: '#14b088', data: nakitAylik.map(a => a.g) }, { name: 'Çıkış', color: '#e14b4b', data: nakitAylik.map(a => a.c) }]} />
            </Card>
            <Card title="Hesap Bazlı Hareket" right={<button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={() => csvDownload('nakit-akisi.csv', hesapAkis.map(h => ({ Hesap: h.ad, Açılış: h.acilis, Giriş: h.gir, Çıkış: h.cik, Kapanış: h.kapanis })))}><Download size={13} />CSV</button>}>
              <table className="adm-tbl"><thead><tr><th>Hesap</th><th style={{ textAlign: 'right' }}>Açılış</th><th style={{ textAlign: 'right' }}>Giriş</th><th style={{ textAlign: 'right' }}>Çıkış</th><th style={{ textAlign: 'right' }}>Net</th><th style={{ textAlign: 'right' }}>Kapanış</th></tr></thead>
                <tbody>{hesapAkis.map(h => <tr key={h.ad}><td><b>{h.ad}</b></td><td style={{ textAlign: 'right' }}>{fmt(h.acilis)}</td><td style={{ textAlign: 'right' }}><Money v={h.gir} tone="green" bold={false} /></td><td style={{ textAlign: 'right' }}><Money v={h.cik} tone="red" bold={false} /></td><td style={{ textAlign: 'right' }}><Money v={h.net} tone="auto" /></td><td style={{ textAlign: 'right' }}><Money v={h.kapanis} /></td></tr>)}</tbody>
                {hesapAkis.length > 0 && <tfoot><tr><td>Toplam</td><td style={{ textAlign: 'right' }}>{fmt(sum(hesapAkis, h => h.acilis))}</td><td style={{ textAlign: 'right' }}>{fmt(sum(hesapAkis, h => h.gir))}</td><td style={{ textAlign: 'right' }}>{fmt(sum(hesapAkis, h => h.cik))}</td><td style={{ textAlign: 'right' }}>{fmt(sum(hesapAkis, h => h.net))}</td><td style={{ textAlign: 'right' }}>{fmt(sum(hesapAkis, h => h.kapanis))}</td></tr></tfoot>}
              </table>
              {hesapAkis.length === 0 && <Empty title="Kasa/banka hesabı yok" />}
            </Card>
          </>}

          {/* ══ KDV ══ */}
          {rapor === 'kdv' && <>
            <KpiGrid min={210}>
              <Kpi label="Hesaplanan KDV" value={fmtK(kdvHes)} Icon={Receipt} color="var(--adm-blue)" sub={`${fatDonem.filter(f => f.tip === 'satis').length} satış faturası`} />
              <Kpi label="İndirilecek KDV" value={fmtK(kdvInd)} Icon={Receipt} color="var(--adm-amber)" sub={`${fatDonem.filter(f => f.tip === 'alis').length} alış faturası`} />
              <Kpi label={kdvHes - kdvInd >= 0 ? 'Ödenecek KDV' : 'Devreden KDV'} value={fmtK(Math.abs(kdvHes - kdvInd))} Icon={Scale} color={kdvHes - kdvInd >= 0 ? 'var(--adm-red)' : 'var(--adm-green)'} sub="Hesaplanan − İndirilecek" />
            </KpiGrid>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16 }}>
              <Card title="Aylık KDV (12 ay)" pad={16}><TrendChart type="bar" labels={aylar.map(a => a.label)} series={[{ name: 'Hesaplanan', color: '#2f7dd6', data: kdvAylik.map(a => a.h) }, { name: 'İndirilecek', color: '#c9821c', data: kdvAylik.map(a => a.i) }]} height={210} /></Card>
              <Card title="KDV Oranına Göre">
                {kdvOran.length === 0 ? <Empty title="Bu dönemde onaylı fatura yok" /> : <table className="adm-tbl"><thead><tr><th>Oran</th><th style={{ textAlign: 'right' }}>Satış matrahı</th><th style={{ textAlign: 'right' }}>Hesaplanan</th><th style={{ textAlign: 'right' }}>İndirilecek</th></tr></thead>
                  <tbody>{kdvOran.map(([o, v]) => <tr key={o}><td><Badge tone="blue">{o}</Badge></td><td style={{ textAlign: 'right' }}>{fmt(v.matrah)}</td><td style={{ textAlign: 'right' }}>{fmt(v.h)}</td><td style={{ textAlign: 'right' }}>{fmt(v.i)}</td></tr>)}</tbody></table>}
              </Card>
            </div>
          </>}

          {/* ══ YAŞLANDIRMA ══ */}
          {rapor === 'yas' && <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title="Alacak Yaşlandırma (müşteri)" pad={18}><StackBar parts={yasToplam('alacak')} /></Card>
              <Card title="Borç Yaşlandırma (tedarikçi)" pad={18}><StackBar parts={yasToplam('borc')} /></Card>
            </div>
            <Card title="Cari Bazlı Yaşlandırma" right={<button className="adm-btn-ghost" style={{ fontSize: 12 }} onClick={() => csvDownload('yaslandirma.csv', yas.flatMap((x: any) => (['alacak', 'borc'] as const).filter(k => sum(AGING, a => x[k][a.k]) > 0).map(k => ({ Cari: x.ad, Yön: k === 'alacak' ? 'Alacak' : 'Borç', ...Object.fromEntries(AGING.map(a => [a.l, x[k][a.k]])) }))))}><Download size={13} />CSV</button>}>
              {yas.length === 0 ? <Empty title="Açık fatura yok" sub="Onaylanmış ve tamamı ödenmemiş fatura bulunmuyor" /> : (
                <div style={{ overflow: 'auto' }}><table className="adm-tbl">
                  <thead><tr><th>Cari</th><th>Yön</th>{AGING.map(a => <th key={a.k} style={{ textAlign: 'right' }}>{a.l}</th>)}<th style={{ textAlign: 'right' }}>Toplam</th></tr></thead>
                  <tbody>{yas.flatMap((x: any) => (['alacak', 'borc'] as const).filter(k => sum(AGING, a => x[k][a.k]) > 0).map(k => (
                    <tr key={x.ad + k}><td><b>{x.ad}</b></td><td><Badge tone={k === 'alacak' ? 'green' : 'red'}>{k === 'alacak' ? 'Alacak' : 'Borç'}</Badge></td>
                      {AGING.map(a => <td key={a.k} style={{ textAlign: 'right', color: x[k][a.k] && a.k !== 'guncel' ? a.color : undefined, fontWeight: x[k][a.k] && a.k !== 'guncel' ? 700 : 400 }}>{x[k][a.k] ? fmt(x[k][a.k]) : '—'}</td>)}
                      <td style={{ textAlign: 'right' }}><b>{fmt(sum(AGING, a => x[k][a.k]))}</b></td></tr>)))}</tbody>
                </table></div>)}
            </Card>
          </>}

          {/* ══ SATIŞ ANALİZİ ══ */}
          {rapor === 'satis' && <>
            <KpiGrid min={200}>
              <Kpi label="Satış (KDV dahil)" value={fmtK(sum(satisF, f => f.toplam))} Icon={BarChart3} color="var(--adm-green)" sub={`${satisF.length} fatura`} />
              <Kpi label="Ort. Fatura" value={fmtK(satisF.length ? sum(satisF, f => f.toplam) / satisF.length : 0)} Icon={Receipt} color="var(--adm-blue)" />
              <Kpi label="Aktif Müşteri" value={new Set(satisF.map(f => f.cari_id).filter(Boolean)).size} Icon={Users2} color="var(--adm-ac)" sub="bu dönemde fatura kesilen" />
            </KpiGrid>
            <Card title="Aylık Satış (12 ay)" pad={16} style={{ marginBottom: 16 }}><TrendChart type="area" labels={aylar.map(a => a.label)} series={[{ name: 'Satış', color: '#14b088', data: satisAylik }]} height={200} /></Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 16 }}>
              <Card title="En Çok Satın Alan Müşteriler" pad={18}>{topMusteri.length === 0 ? <Empty title="Veri yok" /> : <BarList items={topMusteri} />}</Card>
              <Card title="En Çok Satan Ürünler" pad={18}>{topUrun.length === 0 ? <Empty title="Veri yok" /> : <BarList items={topUrun} color="var(--adm-blue)" />}</Card>
            </div>
          </>}
        </>}
      </Page>
    </div>
  )
}
