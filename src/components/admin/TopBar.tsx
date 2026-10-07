'use client'
import { usePathname } from 'next/navigation'
import QuickActions from './QuickActions'
import MuhasebeRehberi from './MuhasebeRehberi'
import MuhasebeUyarilar from './MuhasebeUyarilar'

export default function AdminTopBar({ title }: { title: string }) {
  const muhasebe = (usePathname() || '').includes('/muhasebe')
  return (
    <div className="adm-topbar">
      <h1>{title}</h1>
      <div style={{marginLeft:'auto', display:'flex', alignItems:'center'}}>
        {muhasebe && <MuhasebeUyarilar/>}
        {muhasebe && <MuhasebeRehberi/>}
        <QuickActions/>
      </div>
    </div>
  )
}
