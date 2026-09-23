'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { TrendingUp, Globe, Clock, BarChart2 } from 'lucide-react'

const sb = createClient()

export default function AdminAnalyticsPage() {
  const [weekly, setWeekly] = useState<{label:string;v:number;date:string}[]>([])
  const [byPage, setByPage] = useState<{page:string;count:number}[]>([])
  const [byStatus, setByStatus] = useState<{label:string;v:number;color:string}[]>([])
  const [totalToday, setTotalToday] = useState(0)
  const [totalWeek, setTotalWeek] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now()-7*24*60*60*1000).toISOString().split('T')[0]

      // Bugün
      const {count:td} = await sb.from('site_visits').select('*',{count:'exact',head:true}).gte('visited_at',today+'T00:00:00')
      setTotalToday(td||0)

      // Bu hafta
      const {count:tw} = await sb.from('site_visits').select('*',{count:'exact',head:true}).gte('visited_at',weekAgo+'T00:00:00')
      setTotalWeek(tw||0)

      // 14 günlük
      const days = Array.from({length:14},(_,i)=>{
        const d=new Date(); d.setDate(d.getDate()-13+i)
        return {label:d.toLocaleDateString('tr',{day:'2-digit',month:'2-digit'}), date:d.toISOString().split('T')[0]}
      })
      const wCounts = await Promise.all(days.map(async d=>{
        const {count} = await sb.from('site_visits').select('*',{count:'exact',head:true}).gte('visited_at',d.date+'T00:00:00').lte('visited_at',d.date+'T23:59:59')
        return {label:d.label,v:count||0,date:d.date}
      }))
      setWeekly(wCounts)

      // Başvuru durumları
      const statuses=[
        {key:'new',label:'Yeni',color:'var(--adm-ac)'},
        {key:'read',label:'Okundu',color:'var(--adm-blue)'},
        {key:'replied',label:'Yanıtlandı',color:'var(--adm-green)'},
        {key:'archived',label:'Arşiv',color:'var(--adm-tx3)'},
      ]
      const sCounts = await Promise.all(statuses.map(async s=>{
        const {count} = await sb.from('contact_submissions').select('*',{count:'exact',head:true}).eq('status',s.key)
        return {label:s.label,v:count||0,color:s.color}
      }))
      setByStatus(sCounts)

      // Sayfa bazlı (ziyaret loglarından)
      const {data:visits} = await sb.from('site_visits').select('page').limit(500)
      const pageCounts: Record<string,number> = {}
      ;(visits||[]).forEach(v=>{ const p=v.page||'/'; pageCounts[p]=(pageCounts[p]||0)+1 })
      setByPage(Object.entries(pageCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([page,count])=>({page,count})))
    }
    load()
  },[])

  const maxV = (arr:{v:number}[]) => Math.max(...arr.map(a=>a.v),1)
  const maxPage = Math.max(...byPage.map(p=>p.count),1)

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Analitik"/>
      <div style={{padding:24}}>

        {/* Özet KPI'lar */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
          {[
            {label:'Bugünkü Ziyaret',  value:totalToday, Icon:Clock,     color:'var(--adm-green)'},
            {label:'Bu Haftaki Ziyaret',value:totalWeek, Icon:TrendingUp,color:'var(--adm-ac)'},
            {label:'Toplam Başvuru',   value:byStatus.reduce((a,b)=>a+b.v,0), Icon:Globe, color:'var(--adm-blue)'},
            {label:'Yanıt Oranı',      value:`${byStatus[0]?.v||0>0?Math.round((byStatus[2]?.v||0)/byStatus.reduce((a,b)=>a+b.v,1)*100):0}%`, Icon:BarChart2, color:'var(--adm-amber)'},
          ].map(k=>(
            <div key={k.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${k.color}`}}>
              <div style={{position:'absolute',top:0,right:0,width:70,height:70,background:`radial-gradient(circle at top right,${k.color}18,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{width:32,height:32,borderRadius:8,background:k.color+'18',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                <k.Icon size={14} style={{color:k.color}} strokeWidth={1.9}/>
              </div>
              <p className="adm-kpi-label">{k.label}</p>
              <p className="adm-kpi-value" style={{fontSize:24}}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* 14 günlük grafik */}
        <div className="adm-card" style={{marginBottom:16}}>
          <div className="adm-card-h"><span style={{display:'flex',alignItems:'center',gap:8}}><TrendingUp size={15} style={{color:'var(--adm-ac)'}}/>14 Günlük Ziyaret Trendi</span></div>
          <div style={{padding:'20px 20px 8px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:3,height:120}}>
              {weekly.map((d,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%',justifyContent:'flex-end'}}>
                  {d.v>0 && <span style={{fontSize:9,color:'var(--adm-ac)',fontWeight:700}}>{d.v}</span>}
                  <div title={`${d.date}: ${d.v} ziyaret`} style={{width:'100%',height:mounted?`${Math.max((d.v/maxV(weekly))*100,d.v>0?4:1)}px`:'0px',background:d.v>0?'linear-gradient(180deg,var(--adm-ac),rgba(229,95,40,.3))':'var(--adm-s4)',borderRadius:'3px 3px 0 0',transition:`height .5s cubic-bezier(.22,1,.36,1) ${i*35}ms`}}/>
                  <span style={{fontSize:8,color:'var(--adm-tx3)',writingMode:'vertical-rl',transform:'rotate(180deg)',height:26,overflow:'hidden'}}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {/* Başvuru dağılımı */}
          <div className="adm-card">
            <div className="adm-card-h">Başvuru Dağılımı</div>
            <div style={{padding:20}}>
              {byStatus.map((s,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:13,color:'var(--adm-tx)',display:'flex',alignItems:'center',gap:6}}>
                      <span style={{width:8,height:8,borderRadius:'50%',background:s.color,display:'inline-block'}}/>
                      {s.label}
                    </span>
                    <span style={{fontSize:13,fontWeight:700,color:s.color,fontFamily:'JetBrains Mono,monospace'}}>{s.v}</span>
                  </div>
                  <div style={{height:7,background:'var(--adm-s4)',borderRadius:4}}>
                    <div style={{height:'100%',width:mounted?`${(s.v/Math.max(...byStatus.map(x=>x.v),1))*100}%`:'0%',background:s.color,borderRadius:4,transition:`width .6s ease ${i*80}ms`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En çok ziyaret edilen sayfalar */}
          <div className="adm-card">
            <div className="adm-card-h">En Çok Ziyaret Edilen Sayfalar</div>
            {byPage.length===0 ? (
              <p style={{padding:20,color:'var(--adm-tx3)',fontSize:13,textAlign:'center'}}>Henüz ziyaret kaydı yok</p>
            ) : byPage.map((p,i)=>(
              <div key={i} className="adm-row">
                <span style={{fontSize:11,fontWeight:700,color:'var(--adm-tx3)',fontFamily:'JetBrains Mono,monospace',width:20,flexShrink:0}}>#{i+1}</span>
                <span style={{flex:1,fontSize:12.5,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'JetBrains Mono,monospace'}}>{p.page}</span>
                <span style={{fontSize:13,fontWeight:700,color:'var(--adm-ac)',fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
