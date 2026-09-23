'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Activity, Send } from 'lucide-react'

export default function CanliUretimPage() {
  const [emirler, setEmirler] = useState<any[]>([])
  const [urunler, setUrunler] = useState<any[]>([])
  const [makineler, setMakineler] = useState<any[]>([])
  const [hareketler, setHareketler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [formlar, setFormlar] = useState<Record<string,{uretilen_adet:string;fire_adet:string;cevrim_suresi:string;fire_nedeni:string}>>({})

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:ue},{data:u},{data:m},{data:h}] = await Promise.all([
      erp.from('uretim_emirleri').select('*').eq('durum','uretimde').order('created_at',{ascending:false}),
      muh.from('products').select('id,name').order('name',{ascending:true}),
      erp.from('makineler').select('id,ad').order('ad',{ascending:true}),
      erp.from('uretim_hareketleri').select('*').order('tarih',{ascending:false}).limit(50),
    ])
    setEmirler(ue||[]); setUrunler(u||[]); setMakineler(m||[]); setHareketler(h||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])
  useEffect(()=>{ const t = setInterval(load, 15000); return ()=>clearInterval(t) },[load])

  function formOf(id:string) { return formlar[id] || {uretilen_adet:'',fire_adet:'0',cevrim_suresi:'',fire_nedeni:''} }
  function setForm(id:string, patch:any) { setFormlar(f=>({...f,[id]:{...formOf(id),...patch}})) }

  async function gonder(emirId:string) {
    const f = formOf(emirId)
    if (!f.uretilen_adet && !f.fire_adet) return
    await erp.from('uretim_hareketleri').insert({
      uretim_emri_id: emirId,
      uretilen_adet: +(f.uretilen_adet||0),
      fire_adet: +(f.fire_adet||0),
      cevrim_suresi: f.cevrim_suresi?+f.cevrim_suresi:null,
      fire_nedeni: f.fire_nedeni||null,
    })
    setForm(emirId, {uretilen_adet:'',fire_adet:'0',cevrim_suresi:'',fire_nedeni:''})
    showToast('Üretim kaydedildi'); load()
  }

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Canlı Üretim"/>
      <div style={{padding:24}}>
        {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
        : emirler.length===0 ? (
          <div className="adm-card"><p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Şu anda &quot;Üretimde&quot; durumunda emir yok</p></div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
            {emirler.map(ue=>{
              const urun = urunler.find((u:any)=>u.id===ue.urun_id)
              const makine = makineler.find((m:any)=>m.id===ue.makine_id)
              const yuzde = ue.planlanan_miktar>0 ? Math.min(100,Math.round((ue.uretilen_miktar/ue.planlanan_miktar)*100)) : 0
              const f = formOf(ue.id)
              return (
                <div key={ue.id} className="adm-card">
                  <div className="adm-card-h">
                    <span style={{display:'flex',alignItems:'center',gap:6}}><Activity size={14} style={{color:'var(--adm-blue)'}}/>{ue.no}</span>
                    <span style={{fontSize:11,color:'var(--adm-tx3)'}}>{makine?.ad||'—'}</span>
                  </div>
                  <div style={{padding:16}}>
                    <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)',marginBottom:6}}>{urun?.name}</p>
                    <div style={{height:8,borderRadius:4,background:'var(--adm-s3)',overflow:'hidden',marginBottom:6}}>
                      <div style={{height:'100%',width:`${yuzde}%`,background:'var(--adm-blue)',transition:'width .3s'}}/>
                    </div>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)',marginBottom:14}}>{ue.uretilen_miktar}/{ue.planlanan_miktar} adet (%{yuzde}) {ue.fire_miktar>0?`· Fire: ${ue.fire_miktar}`:''}</p>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                      <div><label className="adm-label" style={{fontSize:10.5}}>Üretilen Adet</label><input type="number" className="adm-inp" value={f.uretilen_adet} onChange={e=>setForm(ue.id,{uretilen_adet:e.target.value})}/></div>
                      <div><label className="adm-label" style={{fontSize:10.5}}>Fire Adet</label><input type="number" className="adm-inp" value={f.fire_adet} onChange={e=>setForm(ue.id,{fire_adet:e.target.value})}/></div>
                      <div><label className="adm-label" style={{fontSize:10.5}}>Çevrim (sn)</label><input type="number" className="adm-inp" value={f.cevrim_suresi} onChange={e=>setForm(ue.id,{cevrim_suresi:e.target.value})}/></div>
                      <div><label className="adm-label" style={{fontSize:10.5}}>Fire Nedeni</label><input className="adm-inp" value={f.fire_nedeni} onChange={e=>setForm(ue.id,{fire_nedeni:e.target.value})}/></div>
                    </div>
                    <button className="adm-btn" style={{width:'100%'}} onClick={()=>gonder(ue.id)}><Send size={13}/>Kaydet</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="adm-card" style={{marginTop:20}}>
          <div className="adm-card-h">Son Üretim Hareketleri</div>
          {hareketler.length===0 ? <p style={{padding:30,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Hareket yok</p>
          : hareketler.map((h:any)=>{
            const emir = emirler.find((e:any)=>e.id===h.uretim_emri_id)
            return (
              <div key={h.id} className="adm-row">
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{emir?.no || h.uretim_emri_id}</p>
                  <p style={{fontSize:11,color:'var(--adm-tx3)'}}>{muh.date(h.tarih)} {h.fire_nedeni?`· ${h.fire_nedeni}`:''}</p>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:'var(--adm-green)',fontFamily:'JetBrains Mono,monospace'}}>+{h.uretilen_adet}</span>
                {h.fire_adet>0 && <span style={{fontSize:12,color:'var(--adm-red)',fontFamily:'JetBrains Mono,monospace'}}>Fire: {h.fire_adet}</span>}
              </div>
            )
          })}
        </div>
      </div>
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
