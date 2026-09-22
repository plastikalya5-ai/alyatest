'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'

const sb = createClient()

export default function AnalyticsPage() {
  const [weekly, setWeekly] = useState<{ label: string; v: number }[]>([])
  const [byCat,  setByCat]  = useState<{ label: string; v: number }[]>([])
  const [byStatus, setByStatus] = useState<{ label: string; v: number; color: string }[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function load() {
      // 14 günlük ziyaret
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - 13 + i)
        return { label: d.toLocaleDateString('tr', { day: '2-digit', month: '2-digit' }), date: d.toISOString().split('T')[0] }
      })
      const wCounts = await Promise.all(days.map(async d => {
        const { count } = await sb.from('site_visits').select('*', { count: 'exact', head: true })
          .gte('visited_at', d.date + 'T00:00:00').lte('visited_at', d.date + 'T23:59:59')
        return { label: d.label, v: count || 0 }
      }))
      setWeekly(wCounts)

      // Kategoriye göre ürün
      const { data: cats } = await sb.from('categories').select('slug,name').order('sort_order')
      const cCounts = await Promise.all((cats || []).map(async c => {
        const { count } = await sb.from('products').select('*', { count: 'exact', head: true }).eq('category', c.slug)
        return { label: c.name, v: count || 0 }
      }))
      setByCat(cCounts)

      // Başvuru durumları
      const statuses = [
        { key: 'new',      label: 'Yeni',        color: 'var(--adm-ac)' },
        { key: 'read',     label: 'Okundu',      color: 'var(--adm-blue)' },
        { key: 'replied',  label: 'Yanıtlandı',  color: 'var(--adm-green)' },
        { key: 'archived', label: 'Arşiv',       color: 'var(--adm-tx3)' },
      ]
      const sCounts = await Promise.all(statuses.map(async s => {
        const { count } = await sb.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', s.key)
        return { label: s.label, v: count || 0, color: s.color }
      }))
      setByStatus(sCounts)
    }
    load()
  }, [])

  const maxV = (arr: { v: number }[]) => Math.max(...arr.map(a => a.v), 1)

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Analitik" />
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Ziyaret grafiği */}
          <div className="adm-card">
            <div className="adm-card-h"><span className="adm-card-title">14 Günlük Ziyaret Trendi</span></div>
            <div style={{ padding: '20px 20px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
                {weekly.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 9, color: 'var(--adm-ac)', fontWeight: 600, opacity: d.v > 0 ? 1 : 0 }}>{d.v || ''}</span>
                    <div style={{
                      width: '100%',
                      height: mounted ? `${Math.max((d.v / maxV(weekly)) * 90, d.v > 0 ? 4 : 0)}px` : '0px',
                      background: 'linear-gradient(180deg, var(--adm-ac), rgba(229,95,40,.3))',
                      borderRadius: '3px 3px 0 0',
                      transition: `height .5s cubic-bezier(.22,1,.36,1) ${i * 35}ms`,
                    }} />
                    <span style={{ fontSize: 8, color: 'var(--adm-tx3)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 28 }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Başvuru durumları */}
          <div className="adm-card">
            <div className="adm-card-h"><span className="adm-card-title">Başvuru Dağılımı</span></div>
            <div style={{ padding: 20 }}>
              {byStatus.map((s, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--adm-tx)' }}>{s.label}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono,monospace' }}>{s.v}</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--adm-s4)', borderRadius: 4 }}>
                    <div style={{
                      height: '100%',
                      width: mounted ? `${(s.v / Math.max(...byStatus.map(x => x.v), 1)) * 100}%` : '0%',
                      background: s.color,
                      borderRadius: 4,
                      transition: `width .6s ease ${i * 80}ms`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kategoriye göre ürün */}
        <div className="adm-card">
          <div className="adm-card-h"><span className="adm-card-title">Kategoriye Göre Ürün Dağılımı</span></div>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {byCat.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--adm-tx)', fontWeight: 500 }}>{c.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-ac)', fontFamily: 'JetBrains Mono,monospace' }}>{c.v}</span>
                </div>
                <div style={{ height: 8, background: 'var(--adm-s4)', borderRadius: 4 }}>
                  <div style={{
                    height: '100%',
                    width: mounted ? `${(c.v / maxV(byCat)) * 100}%` : '0%',
                    background: `linear-gradient(90deg, var(--adm-ac), rgba(229,95,40,.5))`,
                    borderRadius: 4,
                    transition: `width .7s ease ${i * 80}ms`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
