'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, Tag, Percent } from 'lucide-react'

export default function FiyatListeleriPage() {
  const [listeler, setListeler] = useState<any[]>([])
  const [kalemler, setKalemler] = useState<any[]>([])
  const [variantlar, setVariantlar] = useState<any[]>([])
  const [kademeler, setKademeler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detay, setDetay] = useState<any>(null)
  const [kademeModal, setKademeModal] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ ad:'', aciklama:'', varsayilan:false })
  const [kalemForm, setKalemForm] = useState({ variant_id:'', fiyat:'' })
  const [kademeForm, setKademeForm] = useState({ min_miktar:'', iskonto_yuzdesi:'', aciklama:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:l},{data:k},{data:v},{data:i}] = await Promise.all([
      erp.from('fiyat_listeleri').select('*').order('ad',{ascending:true}),
      erp.from('fiyat_listesi_kalemleri').select('*'),
      muh.from('product_variants').select('id,name,product_id').order('name',{ascending:true}),
      erp.from('iskonto_kademeleri').select('*').order('min_miktar',{ascending:true}),
    ])
    setListeler(l||[]); setKalemler(k||[]); setVariantlar(v||[]); setKademeler(i||[]); setLoading(false)
    setDetay((d:any)=>d ? (l||[]).find((x:any)=>x.id===d.id) || null : null)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setForm({ad:'',aciklama:'',varsayilan:false}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    await erp.from('fiyat_listeleri').insert(form)
    setModal(false); showToast('Fiyat listesi oluşturuldu'); load()
  }
  async function del(id:string) {
    if (!confirm('Silinsin mi? Bu listeyi kullanan cariler etkilenir.')) return
    await erp.from('fiyat_listeleri').delete().eq('id',id)
    showToast('Silindi'); load(); setDetay(null)
  }

  async function kalemEkle(e:React.FormEvent) {
    e.preventDefault()
    if (!detay || !kalemForm.variant_id || !kalemForm.fiyat) return
    await erp.from('fiyat_listesi_kalemleri').upsert({ fiyat_listesi_id: detay.id, variant_id: kalemForm.variant_id, fiyat: +kalemForm.fiyat })
    setKalemForm({variant_id:'',fiyat:''}); showToast('Fiyat eklendi'); load()
  }
  async function kalemSil(id:string) {
    await erp.from('fiyat_listesi_kalemleri').delete().eq('id',id)
    showToast('Kaldırıldı'); load()
  }

  async function kademeKaydet(e:React.FormEvent) {
    e.preventDefault()
    await erp.from('iskonto_kademeleri').insert({...kademeForm, min_miktar:+kademeForm.min_miktar, iskonto_yuzdesi:+kademeForm.iskonto_yuzdesi})
    setKademeModal(false); setKademeForm({min_miktar:'',iskonto_yuzdesi:'',aciklama:''}); showToast('Kademe eklendi'); load()
  }
  async function kademeSil(id:string) {
    if (!confirm('Silinsin mi?')) return
    await erp.from('iskonto_kademeleri').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  const detayKalemleri = detay ? kalemler.filter(k=>k.fiyat_listesi_id===detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Fiyat Listeleri & İskonto"/>
      <div style={{padding:24}}>

        {/* Miktar kademeli iskonto */}
        <div className="adm-card" style={{marginBottom:20}}>
          <div className="adm-card-h">
            <span style={{display:'flex',alignItems:'center',gap:6}}><Percent size={14}/>Miktar Kademeli İskonto (Genel)</span>
            <button className="adm-btn-ghost" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>setKademeModal(true)}><Plus size={12}/>Kademe Ekle</button>
          </div>
          {kademeler.length===0 ? <p style={{padding:20,textAlign:'center',color:'var(--adm-tx3)',fontSize:12.5}}>Kademe tanımlanmadı — tüm satışlar liste fiyatından yapılır</p>
          : kademeler.map((k:any)=>(
            <div key={k.id} className="adm-row">
              <p style={{flex:1,fontSize:12.5,color:'var(--adm-tx)'}}>{k.min_miktar}+ adet {k.aciklama?`(${k.aciklama})`:''}</p>
              <span style={{fontSize:13,fontWeight:700,color:'var(--adm-green)'}}>%{k.iskonto_yuzdesi} indirim</span>
              <button className="adm-btn-danger" style={{padding:'4px 8px'}} onClick={()=>kademeSil(k.id)}><Trash2 size={11}/></button>
            </div>
          ))}
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Fiyat Listesi Oluştur</button>
        </div>

        <div className={`adm-detail-grid ${detay?'has-detail':''}`}>
          <div className="adm-card">
            <div className="adm-card-h">Fiyat Listeleri ({listeler.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : listeler.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz fiyat listesi yok — varsayılan ürün fiyatları kullanılıyor</p>
            : listeler.map(l=>(
              <div key={l.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===l.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(l)}>
                <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Tag size={15} style={{color:'var(--adm-ac)'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{l.ad} {l.varsayilan && <span className="adm-badge" style={{background:'var(--adm-green2)',color:'var(--adm-green)',fontSize:9}}>Varsayılan</span>}</p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{kalemler.filter(k=>k.fiyat_listesi_id===l.id).length} ürün fiyatlandırılmış</p>
                </div>
                <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();del(l.id)}}><Trash2 size={12}/></button>
              </div>
            ))}
          </div>

          {detay && (
            <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0,maxHeight:'80vh',overflow:'auto'}}>
              <div className="adm-card-h">
                <span>{detay.ad}</span>
                <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
              </div>
              <div style={{padding:16}}>
                <form onSubmit={kalemEkle} style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8,marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--adm-bdr)'}}>
                  <select className="adm-inp" style={{fontSize:12}} value={kalemForm.variant_id} onChange={e=>setKalemForm(f=>({...f,variant_id:e.target.value}))}>
                    <option value="">Ürün seç</option>
                    {variantlar.map((v:any)=><option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <input type="number" step="0.01" className="adm-inp" style={{fontSize:12}} placeholder="Fiyat ₺" value={kalemForm.fiyat} onChange={e=>setKalemForm(f=>({...f,fiyat:e.target.value}))}/>
                  <button type="submit" className="adm-btn" style={{gridColumn:'1/-1',fontSize:12}}>Fiyat Ekle/Güncelle</button>
                </form>
                {detayKalemleri.length===0 ? <p style={{fontSize:12,color:'var(--adm-tx3)',textAlign:'center'}}>Henüz ürün fiyatlandırılmadı</p>
                : detayKalemleri.map((k:any)=>{
                  const v = variantlar.find((x:any)=>x.id===k.variant_id)
                  return (
                    <div key={k.id} className="adm-row" style={{padding:'8px 0'}}>
                      <span style={{flex:1,fontSize:12.5,color:'var(--adm-tx)'}}>{v?.name}</span>
                      <span style={{fontSize:13,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-tx)'}}>{muh.fmt(k.fiyat)}</span>
                      <button className="adm-btn-danger" style={{padding:'4px 8px'}} onClick={()=>kalemSil(k.id)}><Trash2 size={11}/></button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Yeni Fiyat Listesi<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b">
                <div style={{marginBottom:14}}><label className="adm-label">Ad *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="Toptan Fiyat Listesi"/></div>
                <div><label className="adm-label">Açıklama</label><textarea className="adm-inp" rows={2} value={form.aciklama} onChange={e=>setForm(f=>({...f,aciklama:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Oluştur</button></div>
            </form>
          </div>
        </div>
      )}

      {kademeModal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setKademeModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Yeni İskonto Kademesi<button onClick={()=>setKademeModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={kademeKaydet}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Min. Miktar *</label><input type="number" required className="adm-inp" value={kademeForm.min_miktar} onChange={e=>setKademeForm(f=>({...f,min_miktar:e.target.value}))} placeholder="100"/></div>
                <div><label className="adm-label">İskonto % *</label><input type="number" step="0.1" required className="adm-inp" value={kademeForm.iskonto_yuzdesi} onChange={e=>setKademeForm(f=>({...f,iskonto_yuzdesi:e.target.value}))} placeholder="10"/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Açıklama</label><input className="adm-inp" value={kademeForm.aciklama} onChange={e=>setKademeForm(f=>({...f,aciklama:e.target.value}))} placeholder="Toptan alım"/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setKademeModal(false)}>İptal</button><button type="submit" className="adm-btn">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
