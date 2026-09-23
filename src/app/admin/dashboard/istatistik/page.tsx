'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTopBar from '@/components/admin/TopBar'
import { Package, MessageSquare, Eye, Tag, Star, Sparkles, Inbox, CheckCheck, TrendingUp, BarChart2 } from 'lucide-react'

const sb = createClient()

export default function AdminIstatistikPage() {
  const [data, setData] = useState<Record<string,number>>({})
  const [catData, setCatData] = useState<{name:string;count:number}[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function load() {
      const [
        {count:p},{count:pFeat},{count:pNew},
        {count:cat},{count:c},{count:cNew},
        {count:cRep},{count:cRead},{count:v}
      ] = await Promise.all([
        sb.from('products').select('*',{count:'exact',head:true}),
        sb.from('products').select('*',{count:'exact',head:true}).eq('is_featured',true),
        sb.from('products').select('*',{count:'exact',head:true}).eq('is_new',true),
        sb.from('categories').select('*',{count:'exact',head:true}),
        sb.from('contact_submissions').select('*',{count:'exact',head:true}),
        sb.from('contact_submissions').select('*',{count:'exact',head:true}).eq('status','new'),
        sb.from('contact_submissions').select('*',{count:'exact',head:true}).eq('status','replied'),
        sb.from('contact_submissions').select('*',{count:'exact',head:true}).eq('status','read'),
        sb.from('site_visits').select('*',{count:'exact',head:true}),
      ])
      setData({p:p||0,pFeat:pFeat||0,pNew:pNew||0,cat:cat||0,c:c||0,cNew:cNew||0,cRep:cRep||0,cRead:cRead||0,v:v||0})

      // Kategoriye göre ürün
      const {data:cats} = await sb.from('categories').select('slug,name').order('sort_order')
      const counts = await Promise.all((cats||[]).map(async cat => {
        const {count} = await sb.from('products').select('*',{count:'exact',head:true}).eq('category',cat.slug)
        return {name:cat.name, count:count||0}
      }))
      setCatData(counts)
      setLoading(false)
    }
    load()
  },[])

  const maxCat = Math.max(...catData.map(c=>c.count),1)

  const KPIS = [
    {label:'Toplam Ürün',    value:data.p,     Icon:Package,       color:'var(--adm-ac)',    bg:'var(--adm-ac2)'},
    {label:'Öne Çıkan',     value:data.pFeat, Icon:Star,          color:'var(--adm-amber)', bg:'var(--adm-amber2)'},
    {label:'Yeni Ürün',     value:data.pNew,  Icon:Sparkles,      color:'var(--adm-green)', bg:'var(--adm-green2)'},
    {label:'Kategori',      value:data.cat,   Icon:Tag,           color:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
    {label:'Toplam Başvuru',value:data.c,     Icon:MessageSquare, color:'var(--adm-ac)',    bg:'var(--adm-ac2)'},
    {label:'Yeni Başvuru',  value:data.cNew,  Icon:Inbox,         color:'var(--adm-red)',   bg:'var(--adm-red2)'},
    {label:'Okundu',        value:data.cRead, Icon:Eye,           color:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
    {label:'Yanıtlandı',    value:data.cRep,  Icon:CheckCheck,    color:'var(--adm-green)', bg:'var(--adm-green2)'},
    {label:'Site Ziyareti', value:data.v,     Icon:TrendingUp,    color:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  ]

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="İstatistikler"/>
      <div style={{padding:24}}>
        {loading ? <p style={{textAlign:'center',color:'var(--adm-tx3)',padding:60}}>Yükleniyor...</p> : (
          <>
            {/* KPI Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
              {KPIS.map(k=>(
                <div key={k.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${k.color}`}}>
                  <div style={{position:'absolute',top:0,right:0,width:70,height:70,background:`radial-gradient(circle at top right,${k.color}18,transparent 70%)`,pointerEvents:'none'}}/>
                  <div style={{width:32,height:32,borderRadius:8,background:k.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                    <k.Icon size={14} style={{color:k.color}} strokeWidth={1.9}/>
                  </div>
                  <p className="adm-kpi-label">{k.label}</p>
                  <p className="adm-kpi-value" style={{fontSize:24}}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Kategori dağılımı */}
            <div className="adm-card">
              <div className="adm-card-h"><span style={{display:'flex',alignItems:'center',gap:8}}><BarChart2 size={15} style={{color:'var(--adm-ac)'}}/>Kategoriye Göre Ürün</span></div>
              <div style={{padding:20}}>
                {catData.length===0 ? <p style={{color:'var(--adm-tx3)',fontSize:13}}>Veri yok</p> : catData.map((c,i)=>(
                  <div key={i} style={{marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:500,color:'var(--adm-tx)'}}>{c.name}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:12,color:'var(--adm-tx3)'}}>{c.count} ürün</span>
                        <span style={{fontSize:12,fontWeight:700,color:'var(--adm-ac)',fontFamily:'JetBrains Mono,monospace',width:32,textAlign:'right'}}>{data.p?Math.round(c.count/data.p*100):0}%</span>
                      </div>
                    </div>
                    <div style={{height:8,background:'var(--adm-s4)',borderRadius:4}}>
                      <div style={{height:'100%',width:mounted?`${(c.count/maxCat)*100}%`:'0%',background:`linear-gradient(90deg,var(--adm-ac),rgba(229,95,40,.5))`,borderRadius:4,transition:`width .7s ease ${i*80}ms`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Başvuru özeti */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
              <div className="adm-card">
                <div className="adm-card-h">Başvuru Durumu</div>
                <div style={{padding:20}}>
                  {[
                    {label:'Yeni',       value:data.cNew,  color:'var(--adm-ac)'},
                    {label:'Okundu',     value:data.cRead, color:'var(--adm-blue)'},
                    {label:'Yanıtlandı', value:data.cRep,  color:'var(--adm-green)'},
                    {label:'Toplam',     value:data.c,     color:'var(--adm-tx2)'},
                  ].map((r,i)=>(
                    <div key={i} className="adm-row" style={{padding:'10px 0',borderColor:'var(--adm-bdr)'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:r.color,flexShrink:0}}/>
                      <span style={{flex:1,fontSize:13,color:'var(--adm-tx)'}}>{r.label}</span>
                      <span style={{fontSize:16,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:r.color}}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="adm-card">
                <div className="adm-card-h">Ürün Durumu</div>
                <div style={{padding:20}}>
                  {[
                    {label:'Toplam Ürün',    value:data.p,     color:'var(--adm-ac)'},
                    {label:'Öne Çıkan',      value:data.pFeat, color:'var(--adm-amber)'},
                    {label:'Yeni Etiketli',  value:data.pNew,  color:'var(--adm-green)'},
                    {label:'Kategori Sayısı',value:data.cat,   color:'var(--adm-blue)'},
                  ].map((r,i)=>(
                    <div key={i} className="adm-row" style={{padding:'10px 0',borderColor:'var(--adm-bdr)'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:r.color,flexShrink:0}}/>
                      <span style={{flex:1,fontSize:13,color:'var(--adm-tx)'}}>{r.label}</span>
                      <span style={{fontSize:16,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:r.color}}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
