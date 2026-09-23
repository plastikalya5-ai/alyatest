'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Eye, Globe, Clock, Smartphone, Monitor } from 'lucide-react'

const sb = createClient()

export default function AdminZiyaretcilerPage() {
  const [visits, setVisits] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [today, setToday] = useState(0)
  const [thisWeek, setThisWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(()=>{
    async function load() {
      const todayStr = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now()-7*24*60*60*1000).toISOString()
      const [{data},{count:tc},{count:dc},{count:wc}] = await Promise.all([
        sb.from('site_visits').select('*').order('visited_at',{ascending:false}).limit(200),
        sb.from('site_visits').select('*',{count:'exact',head:true}),
        sb.from('site_visits').select('*',{count:'exact',head:true}).gte('visited_at',todayStr+'T00:00:00'),
        sb.from('site_visits').select('*',{count:'exact',head:true}).gte('visited_at',weekAgo),
      ])
      setVisits(data||[]); setTotal(tc||0); setToday(dc||0); setThisWeek(wc||0)
      setLoading(false)
    }
    load()
  },[])

  const filtered = visits.filter(v=>{
    if(filter==='today') return v.visited_at?.startsWith(new Date().toISOString().split('T')[0])
    return true
  })

  const isMobile = (ua:string) => /mobile|android|iphone|ipad/i.test(ua||'')

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Ziyaretçiler"/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
          {[
            {label:'Toplam Ziyaret',  value:total,    Icon:Eye,   color:'var(--adm-ac)'},
            {label:'Bugün',           value:today,    Icon:Clock, color:'var(--adm-green)'},
            {label:'Bu Hafta',        value:thisWeek, Icon:Globe, color:'var(--adm-blue)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`}}>
              <div style={{width:32,height:32,borderRadius:8,background:s.color+'18',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                <s.Icon size={14} style={{color:s.color}}/>
              </div>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:24}}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[['all','Tümü'],['today','Bugün']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} className={filter===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
          ))}
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Son {filtered.length} Ziyaret</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Henüz ziyaret kaydı yok</p>
          : filtered.map(v=>(
            <div key={v.id} className="adm-row">
              <div style={{width:32,height:32,borderRadius:8,background:'var(--adm-s3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {isMobile(v.user_agent) ? <Smartphone size={13} style={{color:'var(--adm-tx3)'}}/> : <Monitor size={13} style={{color:'var(--adm-tx3)'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{v.page||'/'}</p>
                <p style={{fontSize:11,color:'var(--adm-tx3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.referrer||'Direkt erişim'}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0}}>
                {v.country && <span className="adm-badge adm-badge-muted">{v.country}</span>}
                <span style={{fontSize:10.5,color:'var(--adm-tx3)'}}>{new Date(v.visited_at).toLocaleString('tr')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
