'use client'
import { useEffect, useState } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Download, TrendingUp, TrendingDown, Scale } from 'lucide-react'

export default function RaporlarPage() {
  const [islemler, setIslemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [donem, setDonem] = useState('bu_ay')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    muh.from('islemler').select('*').order('tarih', {ascending:false}).then(({data}:any) => {
      setIslemler(data||[]); setLoading(false)
    })
  }, [])

  const filtrele = (islemler: any[]) => {
    const now = new Date()
    return islemler.filter(i => {
      const d = new Date(i.tarih)
      if (donem==='bu_ay') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
      if (donem==='gecen_ay') {
        const gm = new Date(now.getFullYear(), now.getMonth()-1, 1)
        return d.getMonth()===gm.getMonth() && d.getFullYear()===gm.getFullYear()
      }
      if (donem==='bu_yil') return d.getFullYear()===now.getFullYear()
      return true
    })
  }

  const filtered = filtrele(islemler)
  const gelir = filtered.filter(i=>i.tip==='gelir').reduce((s,i)=>s+(+i.tutar),0)
  const gider = filtered.filter(i=>i.tip==='gider').reduce((s,i)=>s+(+i.tutar),0)
  const kar = gelir - gider

  // Kategori bazlı
  const gelirKat: Record<string,number> = {}
  const giderKat: Record<string,number> = {}
  filtered.forEach(i => {
    if (i.tip==='gelir') gelirKat[i.kategori]=(gelirKat[i.kategori]||0)+(+i.tutar)
    else giderKat[i.kategori]=(giderKat[i.kategori]||0)+(+i.tutar)
  })

  const maxGelir = Math.max(...Object.values(gelirKat),1)
  const maxGider = Math.max(...Object.values(giderKat),1)

  function exportCSV() {
    const cols=['tarih','tip','kategori','aciklama','tutar','odeme_yontemi']
    const csv=[cols.join(','),...filtered.map(i=>cols.map(c=>`"${i[c]||''}"`).join(','))].join('\n')
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv); a.download=`rapor-${donem}.csv`; a.click()
  }

  const DONEM = [
    {v:'bu_ay',label:'Bu Ay'},
    {v:'gecen_ay',label:'Geçen Ay'},
    {v:'bu_yil',label:'Bu Yıl'},
    {v:'tumu',label:'Tümü'},
  ]

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Mali Raporlar"/>
      <div style={{padding:24}}>

        {/* Dönem seçici */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
          <div style={{display:'flex',gap:4,background:'var(--adm-s2)',padding:4,borderRadius:10}}>
            {DONEM.map(d=>(
              <button key={d.v} onClick={()=>setDonem(d.v)}
                style={{padding:'6px 16px',borderRadius:8,fontSize:12.5,fontWeight:donem===d.v?600:400,
                  background:donem===d.v?'var(--adm-s1)':'transparent',
                  color:donem===d.v?'var(--adm-tx)':'var(--adm-tx3)',
                  border:donem===d.v?'1px solid var(--adm-bdr)':'1px solid transparent',
                  cursor:'pointer',fontFamily:'inherit'}}>
                {d.label}
              </button>
            ))}
          </div>
          <button className="adm-btn-ghost" style={{fontSize:12}} onClick={exportCSV}>
            <Download size={13}/>CSV İndir
          </button>
        </div>

        {/* Özet */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
          {[
            {label:'Toplam Gelir', value:gelir, Icon:TrendingUp,  color:'var(--adm-green)', change:`${filtered.filter(i=>i.tip==='gelir').length} işlem`},
            {label:'Toplam Gider', value:gider, Icon:TrendingDown, color:'var(--adm-red)',   change:`${filtered.filter(i=>i.tip==='gider').length} işlem`},
            {label:'Net Kar/Zarar',value:kar,   Icon:Scale,        color:kar>=0?'var(--adm-green)':'var(--adm-red)', change:kar>=0?'✓ Karda':'✗ Zararda'},
          ].map(k=>(
            <div key={k.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${k.color}`}}>
              <div style={{position:'absolute',top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${k.color}18,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:k.color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <k.Icon size={15} style={{color:k.color}} strokeWidth={1.9}/>
                </div>
              </div>
              <p className="adm-kpi-label">{k.label}</p>
              <p className="adm-kpi-value" style={{fontSize:22,color:k.color}}>{muh.fmt(k.value)}</p>
              <p style={{fontSize:11,color:'var(--adm-tx3)',marginTop:6}}>{k.change}</p>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {/* Gelir dağılımı */}
          <div className="adm-card">
            <div className="adm-card-h" style={{gap:8}}><TrendingUp size={14} style={{color:'var(--adm-green)'}}/>Gelir Dağılımı</div>
            <div style={{padding:20}}>
              {Object.keys(gelirKat).length===0 ? <p style={{color:'var(--adm-tx3)',fontSize:13,textAlign:'center',padding:20}}>Bu dönemde gelir yok</p>
              : Object.entries(gelirKat).sort((a,b)=>b[1]-a[1]).map(([kat,tutar],i)=>(
                <div key={kat} style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:12.5,color:'var(--adm-tx)'}}>{kat}</span>
                    <div>
                      <span style={{fontSize:12,color:'var(--adm-tx3)',marginRight:8}}>{Math.round(tutar/gelir*100)}%</span>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--adm-green)',fontFamily:'JetBrains Mono,monospace'}}>{muh.fmt(tutar)}</span>
                    </div>
                  </div>
                  <div style={{height:7,background:'var(--adm-s4)',borderRadius:4}}>
                    <div style={{height:'100%',width:mounted?`${(tutar/maxGelir)*100}%`:'0%',background:'var(--adm-green)',borderRadius:4,transition:`width .6s ease ${i*60}ms`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gider dağılımı */}
          <div className="adm-card">
            <div className="adm-card-h" style={{gap:8}}><TrendingDown size={14} style={{color:'var(--adm-red)'}}/>Gider Dağılımı</div>
            <div style={{padding:20}}>
              {Object.keys(giderKat).length===0 ? <p style={{color:'var(--adm-tx3)',fontSize:13,textAlign:'center',padding:20}}>Bu dönemde gider yok</p>
              : Object.entries(giderKat).sort((a,b)=>b[1]-a[1]).map(([kat,tutar],i)=>(
                <div key={kat} style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:12.5,color:'var(--adm-tx)'}}>{kat}</span>
                    <div>
                      <span style={{fontSize:12,color:'var(--adm-tx3)',marginRight:8}}>{Math.round(tutar/gider*100)}%</span>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--adm-red)',fontFamily:'JetBrains Mono,monospace'}}>{muh.fmt(tutar)}</span>
                    </div>
                  </div>
                  <div style={{height:7,background:'var(--adm-s4)',borderRadius:4}}>
                    <div style={{height:'100%',width:mounted?`${(tutar/maxGider)*100}%`:'0%',background:'var(--adm-red)',borderRadius:4,transition:`width .6s ease ${i*60}ms`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gelir/Gider oranı */}
        {(gelir+gider)>0 && (
          <div className="adm-card" style={{marginTop:16}}>
            <div className="adm-card-h">Gelir / Gider Oranı</div>
            <div style={{padding:20}}>
              <div style={{display:'flex',height:28,borderRadius:8,overflow:'hidden',gap:2}}>
                <div style={{width:mounted?`${gelir/(gelir+gider)*100}%`:'0%',background:'var(--adm-green)',transition:'width .8s ease',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,color:'#fff',whiteSpace:'nowrap',padding:'0 8px'}}>{Math.round(gelir/(gelir+gider)*100)}% Gelir</span>
                </div>
                <div style={{flex:1,background:'var(--adm-red)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:11,fontWeight:700,color:'#fff',whiteSpace:'nowrap',padding:'0 8px'}}>{Math.round(gider/(gelir+gider)*100)}% Gider</span>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <span style={{fontSize:12,color:'var(--adm-tx3)'}}>Toplam işlem: {filtered.length}</span>
                <span style={{fontSize:12,fontWeight:600,color:kar>=0?'var(--adm-green)':'var(--adm-red)'}}>
                  Kar Marjı: {gelir>0?Math.round(kar/gelir*100):0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
