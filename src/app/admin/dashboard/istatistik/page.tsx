'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Package, MessageSquare, Eye, Tag, Star, Sparkles, Inbox } from 'lucide-react'

const sb = createClient()

export default function IstatistikPage() {
  const [data, setData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: p }, { count: pFeat }, { count: pNew },
        { count: cat }, { count: c }, { count: cNew },
        { count: cRep }, { count: v }
      ] = await Promise.all([
        sb.from('products').select('*', { count: 'exact', head: true }),
        sb.from('products').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        sb.from('products').select('*', { count: 'exact', head: true }).eq('is_new', true),
        sb.from('categories').select('*', { count: 'exact', head: true }),
        sb.from('contact_submissions').select('*', { count: 'exact', head: true }),
        sb.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        sb.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'replied'),
        sb.from('site_visits').select('*', { count: 'exact', head: true }),
      ])
      setData({ p: p || 0, pFeat: pFeat || 0, pNew: pNew || 0, cat: cat || 0, c: c || 0, cNew: cNew || 0, cRep: cRep || 0, v: v || 0 })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Toplam Ürün',      value: data.p,     Icon: Package,       color: 'var(--adm-ac)' },
    { label: 'Öne Çıkan Ürün',   value: data.pFeat, Icon: Star,          color: 'var(--adm-amber)' },
    { label: 'Yeni Ürün',        value: data.pNew,  Icon: Sparkles,      color: 'var(--adm-green)' },
    { label: 'Kategori',         value: data.cat,   Icon: Tag,           color: 'var(--adm-blue)' },
    { label: 'Toplam Başvuru',   value: data.c,     Icon: MessageSquare, color: 'var(--adm-ac)' },
    { label: 'Yeni Başvuru',     value: data.cNew,  Icon: Inbox,         color: 'var(--adm-red)' },
    { label: 'Yanıtlanan',       value: data.cRep,  Icon: MessageSquare, color: 'var(--adm-green)' },
    { label: 'Site Ziyareti',    value: data.v,     Icon: Eye,           color: 'var(--adm-blue)' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <AdminTopBar title="İstatistikler" />
      <div style={{ padding: 24 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--adm-tx3)', padding: 60 }}>Yükleniyor...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {cards.map(c => (
              <div key={c.label} className="adm-kpi" style={{ borderLeft: `2.5px solid ${c.color}` }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right,${c.color}18,transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ width: 34, height: 34, borderRadius: 9, background: c.color + '18', border: `1px solid ${c.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <c.Icon size={15} style={{ color: c.color }} strokeWidth={1.9} />
                </div>
                <p className="adm-kpi-label">{c.label}</p>
                <p className="adm-kpi-value" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
