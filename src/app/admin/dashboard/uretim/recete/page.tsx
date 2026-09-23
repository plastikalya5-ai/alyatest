'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Trash2, X, FlaskConical } from 'lucide-react'

export default function RecetePage() {
  const [list, setList] = useState<any[]>([])
  const [urunler, setUrunler] = useState<any[]>([])
  const [hammaddeler, setHammaddeler] = useState<any[]>([])
  const [kaliplar, setKaliplar] = useState<any[]>([])
  const [kalemler, setKalemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detay, setDetay] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ urun_id:'', versiyon:'1', kalip_id:'', kavite_sayisi:'1', hedef_cevrim_suresi:'', hedef_fire_orani:'0', notlar:'' })
  const [receteKalemleri, setReceteKalemleri] = useState([{hammadde_id:'',miktar:0,birim:'gr'}])

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:r},{data:u},{data:h},{data:k},{data:rk}] = await Promise.all([
      erp.from('urun_receteleri').select('*').order('created_at',{ascending:false}),
      muh.from('products').select('id,name').order('name',{ascending:true}),
      erp.from('hammaddeler').select('id,ad,birim,ortalama_maliyet').order('ad',{ascending:true}),
      erp.from('kaliplar').select('id,ad').order('ad',{ascending:true}),
      erp.from('recete_kalemleri').select('*'),
    ])
    setList(r||[]); setUrunler(u||[]); setHammaddeler(h||[]); setKaliplar(k||[]); setKalemler(rk||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() {
    setForm({urun_id:'',versiyon:'1',kalip_id:'',kavite_sayisi:'1',hedef_cevrim_suresi:'',hedef_fire_orani:'0',notlar:''})
    setReceteKalemleri([{hammadde_id:'',miktar:0,birim:'gr'}])
    setModal(true)
  }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, versiyon:+form.versiyon, kalip_id:form.kalip_id||null, kavite_sayisi:+form.kavite_sayisi, hedef_cevrim_suresi:form.hedef_cevrim_suresi?+form.hedef_cevrim_suresi:null, hedef_fire_orani:+form.hedef_fire_orani}
    const { data } = await erp.from('urun_receteleri').insert(payload)
    const receteId = (data as any)?.[0]?.id
    if (receteId) {
      const gecerli = receteKalemleri.filter(k=>k.hammadde_id && k.miktar>0)
      await Promise.all(gecerli.map(k=>erp.from('recete_kalemleri').insert({...k, recete_id:receteId})))
    }
    setModal(false); showToast('Reçete oluşturuldu'); load()
  }

  async function del(id:string) {
    if (!confirm('Reçete silinsin mi?')) return
    await erp.from('urun_receteleri').delete().eq('id',id)
    showToast('Silindi'); load(); setDetay(null)
  }

  const detayKalemleri = detay ? kalemler.filter(k=>k.recete_id===detay.id) : []
  const detayMaliyet = detayKalemleri.reduce((s,k)=>{
    const h = hammaddeler.find((x:any)=>x.id===k.hammadde_id)
    return s + (k.miktar * (h?.ortalama_maliyet||0))
  },0)

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="BOM / Üretim Reçeteleri"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Reçete Oluştur</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:detay?'1fr 380px':'1fr',gap:16}}>
          <div className="adm-card">
            <div className="adm-card-h">Reçeteler ({list.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : list.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz reçete yok</p>
            : list.map(r=>{
              const urun = urunler.find((u:any)=>u.id===r.urun_id)
              const kalip = kaliplar.find((k:any)=>k.id===r.kalip_id)
              return (
                <div key={r.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===r.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(r)}>
                  <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <FlaskConical size={15} style={{color:'var(--adm-ac)'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{urun?.name||'—'} <span style={{color:'var(--adm-tx3)',fontWeight:400,fontSize:11.5}}>v{r.versiyon}</span></p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{kalip?.ad||'Kalıpsız'} · {r.kavite_sayisi} kavite {r.hedef_cevrim_suresi?`· ${r.hedef_cevrim_suresi}sn çevrim`:''}</p>
                  </div>
                  <span className="adm-badge" style={{background:r.aktif?'var(--adm-green2)':'var(--adm-s3)',color:r.aktif?'var(--adm-green)':'var(--adm-tx3)'}}>{r.aktif?'Aktif':'Pasif'}</span>
                </div>
              )
            })}
          </div>

          {detay && (
            <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0}}>
              <div className="adm-card-h">
                <span>{urunler.find((u:any)=>u.id===detay.urun_id)?.name} v{detay.versiyon}</span>
                <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
              </div>
              <div style={{padding:20}}>
                <p style={{fontSize:12,fontWeight:600,color:'var(--adm-tx3)',marginBottom:8}}>Hammadde Kalemleri</p>
                {detayKalemleri.length===0 ? <p style={{fontSize:12,color:'var(--adm-tx3)'}}>Kalem yok</p>
                : detayKalemleri.map((k:any)=>{
                  const h = hammaddeler.find((x:any)=>x.id===k.hammadde_id)
                  return (
                    <div key={k.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                      <span style={{fontSize:12.5,color:'var(--adm-tx)'}}>{h?.ad}</span>
                      <span style={{fontSize:12.5,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-tx3)'}}>{k.miktar} {k.birim}</span>
                    </div>
                  )
                })}
                <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',marginTop:6,borderTop:'2px solid var(--adm-bdr)'}}>
                  <span style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)'}}>Birim Hammadde Maliyeti</span>
                  <span style={{fontSize:14,fontWeight:700,color:'var(--adm-green)',fontFamily:'JetBrains Mono,monospace'}}>{muh.fmt(detayMaliyet)}</span>
                </div>
                <button className="adm-btn-danger" style={{width:'100%',marginTop:14}} onClick={()=>del(detay.id)}><Trash2 size={12}/>Reçeteyi Sil</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal" style={{maxWidth:600}}>
            <div className="adm-modal-h">Yeni Reçete<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Ürün *</label>
                  <select className="adm-inp" required value={form.urun_id} onChange={e=>setForm(f=>({...f,urun_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {urunler.map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Versiyon</label><input type="number" className="adm-inp" value={form.versiyon} onChange={e=>setForm(f=>({...f,versiyon:e.target.value}))}/></div>
                <div><label className="adm-label">Kalıp</label>
                  <select className="adm-inp" value={form.kalip_id} onChange={e=>setForm(f=>({...f,kalip_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {kaliplar.map((k:any)=><option key={k.id} value={k.id}>{k.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Kavite Sayısı</label><input type="number" className="adm-inp" value={form.kavite_sayisi} onChange={e=>setForm(f=>({...f,kavite_sayisi:e.target.value}))}/></div>
                <div><label className="adm-label">Hedef Çevrim (sn)</label><input type="number" className="adm-inp" value={form.hedef_cevrim_suresi} onChange={e=>setForm(f=>({...f,hedef_cevrim_suresi:e.target.value}))}/></div>
                <div><label className="adm-label">Hedef Fire %</label><input type="number" step="0.1" className="adm-inp" value={form.hedef_fire_orani} onChange={e=>setForm(f=>({...f,hedef_fire_orani:e.target.value}))}/></div>

                <div style={{gridColumn:'1/-1'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <label className="adm-label" style={{margin:0}}>Hammadde Kalemleri</label>
                    <button type="button" className="adm-btn-ghost" style={{fontSize:11,padding:'3px 10px'}} onClick={()=>setReceteKalemleri(k=>[...k,{hammadde_id:'',miktar:0,birim:'gr'}])}>+ Kalem Ekle</button>
                  </div>
                  {receteKalemleri.map((k,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:6,marginBottom:8}}>
                      <select className="adm-inp" style={{fontSize:12}} value={k.hammadde_id} onChange={e=>{const y=[...receteKalemleri];y[i]={...y[i],hammadde_id:e.target.value};setReceteKalemleri(y)}}>
                        <option value="">Hammadde seç</option>
                        {hammaddeler.map((h:any)=><option key={h.id} value={h.id}>{h.ad}</option>)}
                      </select>
                      <input type="number" step="0.001" className="adm-inp" placeholder="Miktar" style={{fontSize:12}} value={k.miktar} onChange={e=>{const y=[...receteKalemleri];y[i]={...y[i],miktar:+e.target.value};setReceteKalemleri(y)}}/>
                      <select className="adm-inp" style={{fontSize:12}} value={k.birim} onChange={e=>{const y=[...receteKalemleri];y[i]={...y[i],birim:e.target.value};setReceteKalemleri(y)}}>
                        {['gr','kg','adet','ml'].map(b=><option key={b} value={b}>{b}</option>)}
                      </select>
                      <button type="button" onClick={()=>setReceteKalemleri(k=>k.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-red)'}} disabled={receteKalemleri.length===1}><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
