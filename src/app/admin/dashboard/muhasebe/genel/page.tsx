'use client'
import { useEffect, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { TrendingUp, TrendingDown, Scale, FileText, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

export default function MuhasebeGenelPage() {
  const [gelir, setGelir] = useState(0)
  const [gider, setGider] = useState(0)
  const [faturaCount, setFaturaCount] = useState({ toplam:0, odendi:0, bekliyor:0 })
  const [cariCount, setCariCount] = useState(0)
  const [sonIslemler, setSonIslemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aylik, setAylik] = useState<{ay:string;gelir:number;gider:number}[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function load() {
      const thisYear = new Date().getFullYear()

      const [
        { data: gelirData },
        { data: giderData },
        { count: ftoplam },
        { count: fodendi },
        { count: fbek },
        { count: cari },
        { data: son },
      ] = await Promise.all([
        muh.from('islemler').select('tutar').eq('tip','gelir'),
        muh.from('islemler').select('tutar').eq('tip','gider'),
        muh.from('faturalar').select('id',{count:'exact',head:true} as any),
        muh.from('faturalar').select('id',{count:'exact',head:true} as any).eq('durum','odendi'),
        muh.from('faturalar').select('id',{count:'exact',head:true} as any).eq('durum','onaylandi'),
        muh.from('cari_hesaplar').select('id',{count:'exact',head:true} as any),
        muh.from('islemler').select('*').order('created_at',{ascending:false}).limit(8),
      ])

      setGelir((gelirData||[]).reduce((a:number,i:any)=>a+(+i.tutar||0),0))
      setGider((giderData||[]).reduce((a:number,i:any)=>a+(+i.tutar||0),0))
      setFaturaCount({ toplam:ftoplam||0, odendi:fodendi||0, bekliyor:fbek||0 })
      setCariCount(cari||0)
      setSonIslemler(son||[])

      // Aylık özet (son 6 ay)
      const aylar = Array.from({length:6},(_,i)=>{
        const d = new Date(); d.setMonth(d.getMonth()-5+i)
        return { ay: d.toLocaleDateString('tr-TR',{month:'short',year:'2-digit'}), year:d.getFullYear(), month:d.getMonth()+1 }
      })
      const { data: tumIslemler } = await muh.from('islemler').select('tip,tutar,tarih').gte('tarih',`${thisYear-1}-01-01`)
      const aylikData = aylar.map(a => {
        const islemler = (tumIslemler||[]).filter((i:any) => {
          const d = new Date(i.tarih); return d.getFullYear()===a.year && d.getMonth()+1===a.month
        })
        return {
          ay: a.ay,
          gelir: islemler.filter((i:any)=>i.tip==='gelir').reduce((s:number,i:any)=>s+(+i.tutar),0),
          gider: islemler.filter((i:any)=>i.tip==='gider').reduce((s:number,i:any)=>s+(+i.tutar),0),
        }
      })
      setAylik(aylikData)
      setLoading(false)
    }
    load()
  }, [])

  const kar = gelir - gider
  const maxAylik = Math.max(...aylik.flatMap(a=>[a.gelir,a.gider]),1)

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Muhasebe — Genel Bakış"/>
      <div style={{padding:24}}>

        {/* KPI'lar */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:24}}>
          {[
            {label:'Toplam Gelir',   value:muh.fmt(gelir), Icon:TrendingUp,   color:'var(--adm-green)', sub:'Tüm zamanlar'},
            {label:'Toplam Gider',   value:muh.fmt(gider), Icon:TrendingDown,  color:'var(--adm-red)',   sub:'Tüm zamanlar'},
            {label:'Net Kar/Zarar',  value:muh.fmt(kar),   Icon:Scale,         color:kar>=0?'var(--adm-green)':'var(--adm-red)', sub:kar>=0?'Karda':'Zararda'},
            {label:'Fatura',         value:faturaCount.toplam, Icon:FileText,  color:'var(--adm-amber)', sub:`${faturaCount.odendi} ödendi · ${faturaCount.bekliyor} bekliyor`},
            {label:'Cari Hesap',     value:cariCount,      Icon:Users,         color:'var(--adm-blue)',  sub:'Müşteri + Tedarikçi'},
          ].map(k=>(
            <div key={k.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${k.color}`}}>
              <div style={{position:'absolute',top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${k.color}18,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:k.color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <k.Icon size={15} style={{color:k.color}} strokeWidth={1.9}/>
                </div>
              </div>
              <p className="adm-kpi-label">{k.label}</p>
              <p className="adm-kpi-value" style={{fontSize:22,color:k.color}}>{k.value}</p>
              <p style={{fontSize:11,color:'var(--adm-tx3)',marginTop:6}}>{k.sub}</p>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>

          {/* Aylık gelir/gider grafiği */}
          <div className="adm-card">
            <div className="adm-card-h">Son 6 Aylık Özet</div>
            <div style={{padding:'20px 20px 8px'}}>
              <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120,marginBottom:8}}>
                {aylik.map((a,i)=>(
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,height:'100%',justifyContent:'flex-end'}}>
                    <div style={{width:'100%',display:'flex',gap:2,alignItems:'flex-end',height:100}}>
                      <div style={{flex:1,height:mounted?`${Math.max((a.gelir/maxAylik)*100,a.gelir>0?4:1)}px`:'0px',background:'var(--adm-green)',borderRadius:'2px 2px 0 0',transition:`height .5s ease ${i*60}ms`,opacity:.85}}/>
                      <div style={{flex:1,height:mounted?`${Math.max((a.gider/maxAylik)*100,a.gider>0?4:1)}px`:'0px',background:'var(--adm-red)',borderRadius:'2px 2px 0 0',transition:`height .5s ease ${i*60+30}ms`,opacity:.85}}/>
                    </div>
                    <span style={{fontSize:9,color:'var(--adm-tx3)'}}>{a.ay}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:16,justifyContent:'center'}}>
                <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--adm-tx3)'}}>
                  <span style={{width:10,height:10,borderRadius:2,background:'var(--adm-green)'}}/>Gelir
                </span>
                <span style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--adm-tx3)'}}>
                  <span style={{width:10,height:10,borderRadius:2,background:'var(--adm-red)'}}/>Gider
                </span>
              </div>
            </div>
          </div>

          {/* Hızlı erişim */}
          <div className="adm-card">
            <div className="adm-card-h">Hızlı Erişim</div>
            <div style={{padding:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {href:'/admin/dashboard/muhasebe/faturalar',   label:'Yeni Fatura',      icon:'🧾', color:'var(--adm-ac)'},
                {href:'/admin/dashboard/muhasebe/islemler',    label:'İşlem Ekle',        icon:'💸', color:'var(--adm-green)'},
                {href:'/admin/dashboard/muhasebe/cari',        label:'Cari Ekle',         icon:'👤', color:'var(--adm-blue)'},
                {href:'/admin/dashboard/muhasebe/raporlar',    label:'Raporlar',          icon:'📊', color:'var(--adm-amber)'},
              ].map(l=>(
                <Link key={l.href} href={l.href} style={{
                  display:'flex',alignItems:'center',gap:10,padding:'12px 14px',
                  background:'var(--adm-s2)',borderRadius:10,border:'1px solid var(--adm-bdr)',
                  textDecoration:'none',transition:'border-color .15s'
                }}>
                  <span style={{fontSize:20}}>{l.icon}</span>
                  <span style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Son işlemler */}
        <div className="adm-card">
          <div className="adm-card-h">
            <span>Son İşlemler</span>
            <Link href="/admin/dashboard/muhasebe/islemler" style={{fontSize:12,color:'var(--adm-ac)'}}>Tümü →</Link>
          </div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : sonIslemler.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz işlem yok</p>
          : sonIslemler.map((i:any)=>(
            <div key={i.id} className="adm-row">
              <div style={{width:34,height:34,borderRadius:9,background:i.tip==='gelir'?'var(--adm-green2)':'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {i.tip==='gelir'
                  ? <ArrowUpRight size={16} style={{color:'var(--adm-green)'}}/>
                  : <ArrowDownRight size={16} style={{color:'var(--adm-red)'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.aciklama||i.kategori}</p>
                <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{i.kategori} · {muh.date(i.tarih)}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:700,color:i.tip==='gelir'?'var(--adm-green)':'var(--adm-red)',fontFamily:'JetBrains Mono,monospace'}}>
                  {i.tip==='gelir'?'+':'-'}{muh.fmt(i.tutar)}
                </span>
                <span className="adm-badge" style={{background:i.tip==='gelir'?'var(--adm-green2)':'var(--adm-red2)',color:i.tip==='gelir'?'var(--adm-green)':'var(--adm-red)',fontSize:10}}>
                  {i.tip==='gelir'?'Gelir':'Gider'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
