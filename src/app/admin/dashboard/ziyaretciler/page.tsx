'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Eye, Globe, Monitor } from 'lucide-react'

const sb = createClient()

export default function ZiyaretcilerPage() {
  const [visits, setVisits] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [today, setToday] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const todayStr = new Date().toISOString().split('T')[0]
      const [{ data }, { count: tc }, { count: dc }] = await Promise.all([
        sb.from('site_visits').select('*').order('visited_at', { ascending: false }).limit(100),
        sb.from('site_visits').select('*', { count: 'exact', head: true }),
        sb.from('site_visits').select('*', { count: 'exact', head: true })
          .gte('visited_at', todayStr + 'T00:00:00'),
      ])
      setVisits(data || [])
      setTotal(tc || 0)
      setToday(dc || 0)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="Ziyaretçiler" />
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Toplam Ziyaret', value: total, Icon: Eye, color: 'var(--adm-ac)' },
            { label: 'Bugünkü Ziyaret', value: today, Icon: Globe, color: 'var(--adm-green)' },
            { label: 'Son 100 Kayıt', value: visits.length, Icon: Monitor, color: 'var(--adm-blue)' },
          ].map(s => (
            <div key={s.label} className="adm-kpi" style={{ borderLeft: `2.5px solid ${s.color}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <s.Icon size={15} style={{ color: s.color }} />
              </div>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="adm-card">
          <div className="adm-card-h">
            <span className="adm-card-title">Son 100 Ziyaret</span>
          </div>
          {loading ? (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--adm-tx3)' }}>Yükleniyor...</p>
          ) : visits.length === 0 ? (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--adm-tx3)' }}>Henüz ziyaret kaydı yok</p>
          ) : visits.map(v => (
            <div key={v.id} className="adm-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-tx)' }}>{v.page || '/'}</p>
                <p style={{ fontSize: 11, color: 'var(--adm-tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                  {v.referrer || 'Direkt'}
                </p>
              </div>
              {v.country && <span className="adm-badge badge-muted">{v.country}</span>}
              <span style={{ fontSize: 11, color: 'var(--adm-tx3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {new Date(v.visited_at).toLocaleString('tr')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
