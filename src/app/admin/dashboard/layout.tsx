'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/Sidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/admin/login'
      else setReady(true)
    })
  }, [])

  if (!ready) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--adm-bg)',flexDirection:'column',gap:16 }}>
      <div style={{ width:36,height:36,borderRadius:9,background:'var(--adm-ac)',display:'flex',alignItems:'center',justifyContent:'center',animation:'admPulse 2s ease-in-out infinite' }}>
        <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
      </div>
      <p style={{ color:'var(--adm-tx3)',fontSize:12.5 }}>Yükleniyor...</p>
    </div>
  )

  return (
    <div style={{ display:'flex',height:'100vh',overflow:'hidden' }}>
      <AdminSidebar/>
      <main style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden' }}>
        {children}
      </main>
    </div>
  )
}
