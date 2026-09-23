'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Package, Tag, MessageSquare, Settings, BarChart2, TrendingUp, Eye, Image, LogOut, ExternalLink, FileText, Bell, Activity, Layers, Globe } from 'lucide-react'

const NAV = [
  { g:'Genel', items:[
    { href:'/admin/dashboard',              label:'Dashboard',       Icon:LayoutDashboard },
    { href:'/admin/dashboard/analytics',    label:'Analitik',        Icon:TrendingUp },
    { href:'/admin/dashboard/istatistik',   label:'İstatistikler',   Icon:BarChart2 },
    { href:'/admin/dashboard/aktivite',     label:'Aktivite Logu',   Icon:Activity },
  ]},
  { g:'Ürün Yönetimi', items:[
    { href:'/admin/dashboard/urunler',      label:'Ürünler',         Icon:Package },
    { href:'/admin/dashboard/kategoriler',  label:'Kategoriler',     Icon:Tag },
    { href:'/admin/dashboard/varyantlar',   label:'Varyantlar',      Icon:Layers },
    { href:'/admin/dashboard/gorseller',    label:'Görseller',       Icon:Image },
  ]},
  { g:'Müşteri', items:[
    { href:'/admin/dashboard/basvurular',   label:'Başvurular',      Icon:MessageSquare },
    { href:'/admin/dashboard/ziyaretciler', label:'Ziyaretçiler',    Icon:Eye },
  ]},
  { g:'Site Yönetimi', items:[
    { href:'/admin/dashboard/icerik',       label:'İçerik',          Icon:FileText },
    { href:'/admin/dashboard/ayarlar',      label:'Ayarlar',         Icon:Settings },
    { href:'/admin/dashboard/bildirimler',  label:'Bildirimler',     Icon:Bell },
  ]},
]

export default function AdminSidebar({ onClose }: { onClose?: () => void } = {}) {
  const pathname = usePathname()
  const [init, setInit] = useState('AP')
  const [name, setName] = useState('Admin')

  useEffect(() => {
    try {
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        const n = user.email?.split('@')[0] || 'Admin'
        setName(n); setInit(n.slice(0,2).toUpperCase())
      })
    } catch {}
  }, [])

  const active = (href: string) => href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="adm-sb">
      <div className="adm-sb-logo">
        <div style={{ width:34,height:34,borderRadius:9,background:'var(--adm-ac)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize:13,fontWeight:700,color:'var(--adm-tx)',letterSpacing:'-.2px',lineHeight:1.2 }}>Alya Plastik</p>
          <p style={{ fontSize:9.5,color:'var(--adm-tx3)',marginTop:2 }}>Admin Panel</p>
        </div>
      </div>

      <nav className="adm-sb-nav">
        {NAV.map(sec => (
          <div key={sec.g}>
            <p className="adm-sb-group">{sec.g}</p>
            {sec.items.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={`adm-sb-item ${active(href)?'active':''}`} onClick={onClose}>
                <span style={{ width:20,display:'flex',justifyContent:'center',flexShrink:0 }}><Icon size={14} strokeWidth={1.8}/></span>
                <span style={{ flex:1 }}>{label}</span>
              </Link>
            ))}
          </div>
        ))}
        <div>
          <p className="adm-sb-group">Site</p>
          <a href="https://alyatest-alyis.vercel.app" target="_blank" rel="noopener noreferrer nofollow" className="adm-sb-item">
            <span style={{ width:20,display:'flex',justifyContent:'center' }}><ExternalLink size={14} strokeWidth={1.8}/></span>
            <span style={{ flex:1 }}>Siteyi Gör</span>
          </a>
        </div>
      </nav>

      <div className="adm-sb-user" onClick={async () => {
        await createClient().auth.signOut()
        window.location.href = '/admin/login'
      }}>
        <div className="adm-sb-av">{init}</div>
        <div style={{ flex:1,minWidth:0 }}>
          <p style={{ fontSize:12.5,fontWeight:600,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{name}</p>
          <p style={{ fontSize:10,color:'var(--adm-tx3)',marginTop:1 }}>Yönetici</p>
        </div>
        <LogOut size={13} style={{ color:'var(--adm-tx3)',flexShrink:0 }} strokeWidth={1.8}/>
      </div>
    </aside>
  )
}
