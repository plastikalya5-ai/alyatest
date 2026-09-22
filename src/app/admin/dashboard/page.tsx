'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Package, MessageSquare, Eye, TrendingUp, ArrowUpRight } from 'lucide-react'

const sb = createClient()

function MiniBar({ data }: { data:{label:string;v:number}[] }) {
  const [m,setM] = useState(false)
  useEffect(()=>{const t=setTimeout(()=>setM(true),100);return()=>clearTimeout(t)},[])
  const max = Math.max(...data.map(d=>d.v),1)
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:5,height:72 }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%',justifyContent:'flex-end' }}>
          <div style={{ width:'100%',height:m?`${Math.max((d.v/max)*56,d.v>0?3:0)}px`:'0',background:'linear-gradient(180deg,var(--adm-ac),rgba(229,95,40,.35))',borderRadius:'3px 3px 0 0',transition:`height .55s cubic-bezier(.22,1,.36,1) ${i*40}ms` }}/>
          <span style={{ fontSize:9,color:'var(--adm-tx3)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats,setStats] = useState({products:0,contacts:0,newContacts:0,visits:0})
  const [contacts,setContacts] = useState<any[]>([])
  const [visitData,setVisitData] = useState<{label:string;v:number}[]>([])

  useEffect(()=>{
    async function load() {
      const [{ count:p },{ count:c },{ count:nc },{ count:v }] = await Promise.all([
        sb.from('products').select('*',{count:'exact',head:true}),
        sb.from('contact_submissions').select('*',{count:'exact',head:true}),
        sb.from('contact_submissions').select('*',{count:'exact',head:true}).eq('status','new'),
        sb.from('site_visits').select('*',{count:'exact',head:true}),
      ])
      setStats({products:p||0,contacts:c||0,newContacts:nc||0,visits:v||0})
      const { data:recent } = await sb.from('contact_submissions').select('*').order('created_at',{ascending:false}).limit(5)
      setContacts(recent||[])
      const days = Array.from({length:7},(_,i)=>{
        const d=new Date(); d.setDate(d.getDate()-6+i)
        return {label:d.toLocaleDateString('tr',{weekday:'short'}),date:d.toISOString().split('T')[0]}
      })
      const counts = await Promise.all(days.map(async d=>{
        const {count} = await sb.from('site_visits').select('*',{count:'exact',head:true}).gte('visited_at',d.date+'T00:00:00').lte('visited_at',d.date+'T23:59:59')
        return {label:d.label,v:count||0}
      }))
      setVisitData(counts)
    }
    load()
  },[])

  const ST:Record<string,{l:string;c:string}> = {
    new:{l:'Yeni',c:'var(--adm-ac)'},read:{l:'Okundu',c:'var(--adm-blue)'},
    replied:{l:'Yanıtlandı',c:'var(--adm-green)'},archived:{l:'Arşiv',c:'var(--adm-tx3)'}
  }
  const KPIS = [
    {label:'Toplam Ürün',    value:stats.products,    sub:'aktif ürün',           color:'var(--adm-ac)',    Icon:Package,       trend:'+3'},
    {label:'Toplam Başvuru', value:stats.contacts,    sub:`${stats.newContacts} yeni`, color:'var(--adm-amber)', Icon:MessageSquare, trend:stats.newContacts>0?`+${stats.newContacts}`:undefined},
    {label:'Site Ziyareti',  value:stats.visits,      sub:'tüm zamanlar',          color:'var(--adm-blue)',  Icon:Eye,           trend:undefined},
    {label:'Yeni Başvuru',   value:stats.newContacts, sub:'yanıt bekliyor',        color:'var(--adm-green)', Icon:TrendingUp,    trend:undefined},
  ]

  return (
    <div style={{ flex:1,overflow:'auto' }}>
      <AdminTopBar title="Dashboard"/>
      <div style={{ padding:24 }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:24 }}>
          {KPIS.map(k=>(
            <div key={k.label} className="adm-kpi" style={{ borderLeft:`2.5px solid ${k.color}` }}>
              <div style={{ position:'absolute',top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${k.color}18,transparent 70%)`,pointerEvents:'none' }}/>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10 }}>
                <div style={{ width:34,height:34,borderRadius:9,background:k.color+'18',border:`1px solid ${k.color}25`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <k.Icon size={15} style={{ color:k.color }} strokeWidth={1.9}/>
                </div>
                {k.trend && <span style={{ display:'flex',alignItems:'center',gap:3,fontSize:10.5,fontWeight:600,padding:'2px 7px',borderRadius:5,color:'var(--adm-green)',background:'var(--adm-green2)' }}><ArrowUpRight size={12} strokeWidth={2.5}/>{k.trend}</span>}
              </div>
              <p className="adm-kpi-label">{k.label}</p>
              <p className="adm-kpi-value">{k.value}</p>
              {k.sub && <p style={{ fontSize:12,color:'var(--adm-tx3)',marginTop:7 }}>{k.sub}</p>}
            </div>
          ))}
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
          <div className="adm-card">
            <div className="adm-card-h">Günlük Ziyaret (7 Gün)</div>
            <div style={{ padding:20 }}><MiniBar data={visitData}/></div>
          </div>
          <div className="adm-card">
            <div className="adm-card-h">
              <span>Son Başvurular</span>
              <a href="/admin/dashboard/basvurular" style={{ fontSize:12,color:'var(--adm-ac)' }}>Tümü →</a>
            </div>
            {contacts.length===0 ? <p style={{ padding:20,color:'var(--adm-tx3)',fontSize:13,textAlign:'center' }}>Başvuru yok</p>
            : contacts.map(c=>(
              <div key={c.id} className="adm-row">
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.name}</p>
                  <p style={{ fontSize:11.5,color:'var(--adm-tx3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.email}</p>
                </div>
                <span className="adm-badge" style={{ background:ST[c.status||'new']?.c+'22',color:ST[c.status||'new']?.c,flexShrink:0 }}>
                  {ST[c.status||'new']?.l}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginTop:16 }}>
          {[
            {href:'/admin/dashboard/urunler',   label:'Ürün Ekle',       icon:'📦'},
            {href:'/admin/dashboard/basvurular',label:'Başvurular',      icon:'📩'},
            {href:'/admin/dashboard/ayarlar',   label:'Site Ayarları',   icon:'⚙️'},
            {href:'/admin/dashboard/analytics', label:'Analitik',        icon:'📊'},
          ].map(l=>(
            <a key={l.href} href={l.href} className="adm-card" style={{ padding:16,display:'flex',alignItems:'center',gap:10,cursor:'pointer',textDecoration:'none' }}>
              <span style={{ fontSize:20 }}>{l.icon}</span>
              <span style={{ fontSize:13,fontWeight:600,color:'var(--adm-tx)' }}>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
