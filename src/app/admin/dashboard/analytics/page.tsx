'use client'
import { useEffect, useMemo, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { webAll, cihaz, kaynakAd } from '@/lib/web-data'
import { fmtInt, fmtN, todayISO } from '@/lib/fmt'
import { iso, pctDelta, CHART_COLORS } from '@/lib/muh-utils'
import { Page, PageHead, Kpi, KpiGrid, Card, Tabs, Empty, Skeleton } from '@/components/admin/erp/ui'
import { TrendChart, Donut, BarList } from '@/components/admin/erp/charts'
import { Eye, Calendar, TrendingUp, MessageSquare, Percent, Globe } from 'lucide-react'

const GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const top = (arr: string[], n = 7) => { const m: Record<string, number> = {}; arr.forEach(a => { m[a] = (m[a] || 0) + 1 }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n) }

export default function AdminAnalyticsPage() {
  const [gun, setGun] = useState('30')
  const [visits, setVisits] = useState<any[] | null>(null)
  const [leads, setLeads] = useState<any[]>([])
  useEffect(() => { Promise.all([webAll('site_visits', '*', q => q.order('visited_at', { ascending: false })), webAll('contact_submissions', 'created_at,status,product,subject')]).then(([v, l]) => { setVisits(v); setLeads(l) }) }, [])

  const n = gun === 'tumu' ? 3650 : +gun
  const lim = Date.now() - n * 86400000, lim2 = Date.now() - 2 * n * 86400000
  const cur = useMemo(() => (visits || []).filter(v => +new Date(v.visited_at) >= lim), [visits, gun]) // eslint-disable-line
  const prev = useMemo(() => (visits || []).filter(v => +new Date(v.visited_at) < lim && +new Date(v.visited_at) >= lim2), [visits, gun]) // eslint-disable-line
  const curLeads = leads.filter(l => +new Date(l.created_at) >= lim)
  const bugun = todayISO()

  const seri = useMemo(() => {
    const len = Math.min(n, 60)
    const g = Array.from({ length: len }, (_, i) => { const t = new Date(); t.setDate(t.getDate() - (len - 1 - i)); return iso(t) })
    return { labels: g.map(x => `${x.slice(8)}.${x.slice(5, 7)}`), v: g.map(k => cur.filter(v => (v.visited_at || '').startsWith(k)).length) }
  }, [cur, n])
  const saat = useMemo(() => Array.from({ length: 24 }, (_, h) => cur.filter(v => new Date(v.visited_at).getHours() === h).length), [cur])
  const haftaGunu = useMemo(() => GUN.map((_, i) => cur.filter(v => new Date(v.visited_at).getDay() === i).length), [cur])
  const sayfalar = top(cur.map(v => v.page || '/'), 8), kaynaklar = top(cur.map(v => kaynakAd(v.referrer)), 7), ulkeler = top(cur.map(v => v.country || 'Bilinmiyor'), 7)
  const cihazlar = top(cur.map(v => cihaz(v.user_agent).tip), 4), tarayicilar = top(cur.map(v => cihaz(v.user_agent).tarayici), 5)
  const bugunZ = (visits || []).filter(v => (v.visited_at || '').startsWith(bugun)).length
  const donusum = cur.length ? (curLeads.length / cur.length) * 100 : 0
  const konular = top(curLeads.map(l => l.product || l.subject || 'Genel'), 6)
  const enYogunSaat = saat.indexOf(Math.max(...saat))

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Analitik" />
      <Page>
        <PageHead title="Web Sitesi Analitiği" sub="Ziyaretçi trafiği, kaynaklar, cihazlar ve başvuru dönüşümü · botlar hariç" actions={<Tabs value={gun} onChange={setGun} tabs={[{ v: '7', l: '7 gün' }, { v: '30', l: '30 gün' }, { v: '90', l: '90 gün' }, { v: 'tumu', l: 'Tümü' }]} />} />
        {visits === null ? <KpiGrid>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="adm-kpi"><Skeleton h={10} w={80} /><Skeleton h={24} w={100} style={{ marginTop: 14 }} /></div>)}</KpiGrid> : <>
          <KpiGrid min={190}>
            <Kpi label="Ziyaret" value={fmtInt(cur.length)} Icon={Eye} color="var(--adm-blue)" delta={gun === 'tumu' ? null : pctDelta(cur.length, prev.length)} sub={gun === 'tumu' ? 'tüm zamanlar' : 'önceki döneme göre'} spark={seri.v} />
            <Kpi label="Bugün" value={fmtInt(bugunZ)} Icon={Calendar} color="var(--adm-ac)" sub={`günlük ort. ${fmtN(cur.length / Math.max(Math.min(n, Math.ceil((Date.now() - +new Date((visits[visits.length - 1] || {}).visited_at || Date.now())) / 86400000) || 1)), 1)}`} />
            <Kpi label="Başvuru" value={curLeads.length} Icon={MessageSquare} color="var(--adm-green)" sub="bu dönemde gelen" />
            <Kpi label="Dönüşüm" value={`%${fmtN(donusum, 2)}`} Icon={Percent} color="var(--adm-amber)" sub="başvuru / ziyaret" />
            <Kpi label="En Yoğun Saat" value={cur.length ? `${String(enYogunSaat).padStart(2, '0')}:00` : '—'} Icon={TrendingUp} color="#8b5cf6" sub={cur.length ? `${fmtInt(saat[enYogunSaat])} ziyaret` : ''} />
          </KpiGrid>

          {visits.length === 0 ? <Card><Empty icon={<Globe size={34} />} title="Henüz ziyaret verisi yok" sub="Ziyaret takibi yeni aktif edildi; siteye gelen ilk ziyaretlerden itibaren veriler burada görünecek." /></Card> : <>
            <Card title="Günlük Ziyaret" pad={16} style={{ marginBottom: 16 }}><TrendChart type="area" height={220} labels={seri.labels} series={[{ name: 'Ziyaret', color: '#2f7dd6', data: seri.v }]} format={v => fmtInt(v)} /></Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title="Saate Göre" pad={16}><TrendChart type="bar" height={180} labels={Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'))} series={[{ name: 'Ziyaret', color: '#8b5cf6', data: saat }]} format={v => fmtInt(v)} /></Card>
              <Card title="Haftanın Günlerine Göre" pad={16}><TrendChart type="bar" height={180} labels={GUN} series={[{ name: 'Ziyaret', color: '#14b088', data: haftaGunu }]} format={v => fmtInt(v)} /></Card>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 16, marginBottom: 16 }}>
              <Card title="En Çok Ziyaret Edilen Sayfalar" pad={18}><BarList items={sayfalar.map(([l, v]) => ({ label: l, value: v }))} format={v => fmtInt(v)} /></Card>
              <Card title="Trafik Kaynakları" pad={18}><BarList items={kaynaklar.map(([l, v]) => ({ label: l, value: v }))} color="var(--adm-green)" format={v => fmtInt(v)} /></Card>
              <Card title="Ülkeler" pad={18}><BarList items={ulkeler.map(([l, v]) => ({ label: l, value: v }))} color="#8b5cf6" format={v => fmtInt(v)} /></Card>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 16 }}>
              <Card title="Cihaz" pad={18}><Donut size={150} data={cihazlar.map(([label, value], i) => ({ label, value, color: CHART_COLORS[i] }))} center={{ top: 'Ziyaret', bottom: fmtInt(cur.length) }} /></Card>
              <Card title="Tarayıcı" pad={18}><Donut size={150} data={tarayicilar.map(([label, value], i) => ({ label, value, color: CHART_COLORS[i + 3] }))} center={{ top: 'Ziyaret', bottom: fmtInt(cur.length) }} /></Card>
              <Card title="Başvuruların İlgi Alanı" pad={18}>{konular.length === 0 ? <Empty title="Bu dönemde başvuru yok" /> : <BarList items={konular.map(([l, v]) => ({ label: l, value: v }))} color="var(--adm-amber)" format={v => `${v} başvuru`} />}</Card>
            </div>
          </>}
        </>}
      </Page>
    </div>
  )
}
