'use client'
import { useEffect, useMemo, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { webAll, cihaz, kaynakAd } from '@/lib/web-data'
import { fmtInt, fmtDateTime, todayISO } from '@/lib/fmt'
import { Page, PageHead, Kpi, KpiGrid, Tabs, Badge } from '@/components/admin/erp/ui'
import { DataGrid, type Col } from '@/components/admin/erp/DataGrid'
import { Eye, Calendar, Globe, Smartphone } from 'lucide-react'

export default function ZiyaretcilerPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [donem, setDonem] = useState('7')
  const [cihazF, setCihazF] = useState('')
  useEffect(() => { webAll('site_visits', '*', q => q.order('visited_at', { ascending: false })).then(r => { setRows(r.map(x => ({ ...x, ...cihaz(x.user_agent), kaynak: kaynakAd(x.referrer) }))); setLoading(false) }) }, [])

  const bugun = todayISO()
  const gun = donem === 'bugun' ? 0 : donem === 'tumu' ? null : +donem
  const liste = useMemo(() => rows.filter(r => (gun == null || (gun === 0 ? (r.visited_at || '').startsWith(bugun) : Date.now() - +new Date(r.visited_at) <= gun * 86400000)) && (!cihazF || r.tip === cihazF)), [rows, donem, cihazF]) // eslint-disable-line
  const mobil = rows.filter(r => r.tip === 'Mobil').length

  const cols: Col<any>[] = [
    { key: 'zaman', label: 'Zaman', width: 150, sort: r => r.visited_at, render: r => <span style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDateTime(r.visited_at)}</span> },
    { key: 'sayfa', label: 'Sayfa', sort: r => r.page || '/', render: r => <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12 }}>{r.page || '/'}</span> },
    { key: 'kaynak', label: 'Kaynak', sort: r => r.kaynak, render: r => r.kaynak === 'Doğrudan' ? <Badge tone="muted">Doğrudan</Badge> : r.kaynak, hideSm: true },
    { key: 'ulke', label: 'Ülke', sort: r => r.country || '', render: r => r.country || '—', hideSm: true },
    { key: 'cihaz', label: 'Cihaz', sort: r => r.tip, render: r => <Badge tone={r.tip === 'Mobil' ? 'blue' : 'muted'}>{r.tip}</Badge> },
    { key: 'tarayici', label: 'Tarayıcı', sort: r => r.tarayici, render: r => r.tarayici, hideSm: true },
  ]
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Ziyaretçiler" />
      <Page>
        <PageHead title="Ziyaret Kayıtları" sub="Ham ziyaret günlüğü — filtrele, ara, dışa aktar" />
        <KpiGrid min={180}>
          <Kpi label="Bugün" value={fmtInt(rows.filter(r => (r.visited_at || '').startsWith(bugun)).length)} Icon={Calendar} color="var(--adm-ac)" />
          <Kpi label="Son 7 Gün" value={fmtInt(rows.filter(r => Date.now() - +new Date(r.visited_at) <= 7 * 86400000).length)} Icon={Eye} color="var(--adm-blue)" />
          <Kpi label="Toplam" value={fmtInt(rows.length)} Icon={Globe} color="var(--adm-green)" sub="tüm zamanlar" />
          <Kpi label="Mobil Oranı" value={rows.length ? `%${Math.round((mobil / rows.length) * 100)}` : '—'} Icon={Smartphone} color="#8b5cf6" sub={`${fmtInt(mobil)} mobil ziyaret`} />
        </KpiGrid>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <Tabs value={donem} onChange={setDonem} tabs={[{ v: 'bugun', l: 'Bugün' }, { v: '7', l: '7 gün' }, { v: '30', l: '30 gün' }, { v: 'tumu', l: 'Tümü' }]} />
          <Tabs value={cihazF} onChange={setCihazF} tabs={[{ v: '', l: 'Tüm cihazlar' }, { v: 'Masaüstü', l: 'Masaüstü' }, { v: 'Mobil', l: 'Mobil' }, { v: 'Tablet', l: 'Tablet' }]} />
        </div>
        <DataGrid rows={liste} cols={cols} rowKey={r => r.id} loading={loading} csvName="ziyaretler" storageKey="ziyaret" pageSizes={[50, 100, 250, 500]} searchText={r => `${r.page || ''} ${r.kaynak} ${r.country || ''} ${r.tarayici}`} searchPlaceholder="Sayfa, kaynak, ülke..." emptyTitle="Ziyaret kaydı yok" emptySub="Ziyaret takibi yeni aktif edildi; veriler siteye gelen ziyaretlerle dolacak." />
      </Page>
    </div>
  )
}
