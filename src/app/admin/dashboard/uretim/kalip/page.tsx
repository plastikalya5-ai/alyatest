'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, Wrench, AlertTriangle } from 'lucide-react'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  uretimde: {l:'Üretimde', c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  hazir:    {l:'Hazır',    c:'var(--adm-green)', bg:'var(--adm-green2)'},
  depoda:   {l:'Depoda',   c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
  bakimda:  {l:'Bakımda',  c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  arizali:  {l:'Arızalı',  c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function KalipPage() {
  const [list, setList] = useState<any[]>([])
  const [urunler, setUrunler] = useState<any[]>([])
  const [bakimlar, setBakimlar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [bakimModal, setBakimModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [detay, setDetay] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ kod:'', ad:'', urettigi_urun_id:'', kavite_sayisi:'1', lokasyon:'', bakim_periyodu_gun:'90', sonraki_bakim:'', durum:'depoda', notlar:'' })
  const [bakimForm, setBakimForm] = useState({ tarih:new Date().toISOString().split('T')[0], aciklama:'', maliyet:'0' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:k},{data:u},{data:b}] = await Promise.all([
      erp.from('kaliplar').select('*').order('ad',{ascending:true}),
      muh.from('products').select('id,name').order('name',{ascending:true}),
      erp.from('kalip_bakim_kayitlari').select('*').order('tarih',{ascending:false}),
    ])
    setList(k||[]); setUrunler(u||[]); setBakimlar(b||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({kod:'',ad:'',urettigi_urun_id:'',kavite_sayisi:'1',lokasyon:'',bakim_periyodu_gun:'90',sonraki_bakim:'',durum:'depoda',notlar:''}); setModal(true) }
  function openEdit(k:any) { setEditing(k); setForm({kod:k.kod,ad:k.ad,urettigi_urun_id:k.urettigi_urun_id||'',kavite_sayisi:String(k.kavite_sayisi),lokasyon:k.lokasyon||'',bakim_periyodu_gun:String(k.bakim_periyodu_gun),sonraki_bakim:k.sonraki_bakim||'',durum:k.durum,notlar:k.notlar||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, urettigi_urun_id:form.urettigi_urun_id||null, kavite_sayisi:+form.kavite_sayisi, bakim_periyodu_gun:+form.bakim_periyodu_gun, sonraki_bakim:form.sonraki_bakim||null}
    if (editing) await erp.from('kaliplar').update(payload).eq('id',editing.id)
    else await erp.from('kaliplar').insert(payload)
    setModal(false); showToast(editing?'Güncellendi':'Kalıp eklendi'); load()
  }
  async function durumGuncelle(id:string, durum:string) {
    await erp.from('kaliplar').update({durum}).eq('id',id)
    showToast('Durum güncellendi'); load()
    if (detay?.id===id) setDetay((d:any)=>({...d,durum}))
  }
  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await erp.from('kaliplar').delete().eq('id',id)
    showToast('Silindi'); load(); setDetay(null)
  }

  async function bakimKaydet(e:React.FormEvent) {
    e.preventDefault()
    if (!detay) return
    await erp.from('kalip_bakim_kayitlari').insert({...bakimForm, maliyet:+bakimForm.maliyet, kalip_id:detay.id})
    const sonrakiTarih = new Date(bakimForm.tarih); sonrakiTarih.setDate(sonrakiTarih.getDate()+detay.bakim_periyodu_gun)
    await erp.from('kaliplar').update({
      son_bakim: bakimForm.tarih,
      sonraki_bakim: sonrakiTarih.toISOString().split('T')[0],
      toplam_baski: detay.toplam_baski,
      durum: 'hazir',
    }).eq('id', detay.id)
    setBakimModal(false); setBakimForm({tarih:new Date().toISOString().split('T')[0],aciklama:'',maliyet:'0'})
    showToast('Bakım kaydedildi'); load()
  }

  const bugun = new Date(); bugun.setHours(0,0,0,0)
  const bakimYaklasan = list.filter(k=>k.sonraki_bakim && new Date(k.sonraki_bakim) <= new Date(bugun.getTime()+14*86400000))
  const kalipBakimlari = detay ? bakimlar.filter(b=>b.kalip_id===detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Kalıp Yönetimi"/>
      <div style={{padding:24}}>
        {bakimYaklasan.length>0 && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--adm-amber)18',border:'1px solid var(--adm-amber)',borderRadius:10,marginBottom:16,fontSize:12.5}}>
            <AlertTriangle size={15} style={{color:'var(--adm-amber)',flexShrink:0}}/>
            <span><b>{bakimYaklasan.length}</b> kalıbın bakım vadesi 14 gün içinde doluyor veya geçmiş.</span>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Kalıp Ekle</button>
        </div>

        <div className={`adm-detail-grid ${detay?"has-detail":""}`}>
          <div className="adm-card">
            <div className="adm-card-h">Kalıplar ({list.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : list.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Henüz kalıp yok</p>
            : list.map(k=>{
              const d = DURUM_CONF[k.durum]||DURUM_CONF.depoda
              const urun = urunler.find((u:any)=>u.id===k.urettigi_urun_id)
              const bakimGecti = k.sonraki_bakim && new Date(k.sonraki_bakim) < bugun
              return (
                <div key={k.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===k.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(k)}>
                  <div style={{width:36,height:36,borderRadius:9,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Wrench size={15} style={{color:d.c}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{k.ad} <span style={{color:'var(--adm-tx3)',fontWeight:400,fontSize:11.5}}>({k.kod})</span></p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{urun?.name||'—'} · {k.kavite_sayisi} kavite {bakimGecti?'· ⚠ Bakım vadesi geçti':''}</p>
                  </div>
                  <span className="adm-badge" style={{background:d.bg,color:d.c}}>{d.l}</span>
                </div>
              )
            })}
          </div>

          {detay && (
            <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0}}>
              <div className="adm-card-h">
                <span>{detay.ad}</span>
                <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
              </div>
              <div style={{padding:20}}>
                <div style={{marginBottom:14}}>
                  {[
                    {l:'Toplam Baskı', v:detay.toplam_baski},
                    {l:'Son Bakım', v:muh.date(detay.son_bakim)},
                    {l:'Sonraki Bakım', v:muh.date(detay.sonraki_bakim)},
                    {l:'Bakım Periyodu', v:`${detay.bakim_periyodu_gun} gün`},
                  ].map(r=>(
                    <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                      <span style={{fontSize:12.5,color:'var(--adm-tx3)'}}>{r.l}</span>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)'}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:12,color:'var(--adm-tx3)',marginBottom:8}}>Durum:</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                  {Object.entries(DURUM_CONF).map(([k,v])=>(
                    <button key={k} onClick={()=>durumGuncelle(detay.id,k)} className={detay.durum===k?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'4px 10px'}}>{v.l}</button>
                  ))}
                </div>
                <button className="adm-btn" style={{width:'100%',marginBottom:14}} onClick={()=>setBakimModal(true)}>Bakım Kaydı Ekle</button>

                <p style={{fontSize:12,fontWeight:600,color:'var(--adm-tx3)',marginBottom:6}}>Bakım Geçmişi</p>
                {kalipBakimlari.length===0 ? <p style={{fontSize:12,color:'var(--adm-tx3)'}}>Kayıt yok</p>
                : kalipBakimlari.map((b:any)=>(
                  <div key={b.id} style={{padding:'8px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                      <span style={{fontSize:12,fontWeight:600,color:'var(--adm-tx)'}}>{muh.date(b.tarih)}</span>
                      <span style={{fontSize:12,color:'var(--adm-amber)',fontFamily:'JetBrains Mono,monospace'}}>{muh.fmt(b.maliyet)}</span>
                    </div>
                    {b.aciklama && <p style={{fontSize:11.5,color:'var(--adm-tx3)',marginTop:2}}>{b.aciklama}</p>}
                  </div>
                ))}
                <div style={{display:'flex',gap:8,marginTop:14}}>
                  <button className="adm-btn-ghost" style={{flex:1}} onClick={()=>openEdit(detay)}><Pencil size={12}/>Düzenle</button>
                  <button className="adm-btn-danger" style={{flex:1}} onClick={()=>del(detay.id)}><Trash2 size={12}/>Sil</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">{editing?'Kalıp Düzenle':'Yeni Kalıp'}<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Kod *</label><input className="adm-inp" required value={form.kod} onChange={e=>setForm(f=>({...f,kod:e.target.value}))} placeholder="KLP-01"/></div>
                <div><label className="adm-label">Ad *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Ürettiği Ürün</label>
                  <select className="adm-inp" value={form.urettigi_urun_id} onChange={e=>setForm(f=>({...f,urettigi_urun_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {urunler.map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Kavite Sayısı</label><input type="number" className="adm-inp" value={form.kavite_sayisi} onChange={e=>setForm(f=>({...f,kavite_sayisi:e.target.value}))}/></div>
                <div><label className="adm-label">Lokasyon</label><input className="adm-inp" value={form.lokasyon} onChange={e=>setForm(f=>({...f,lokasyon:e.target.value}))}/></div>
                <div><label className="adm-label">Bakım Periyodu (gün)</label><input type="number" className="adm-inp" value={form.bakim_periyodu_gun} onChange={e=>setForm(f=>({...f,bakim_periyodu_gun:e.target.value}))}/></div>
                <div><label className="adm-label">Sonraki Bakım</label><input type="date" className="adm-inp" value={form.sonraki_bakim} onChange={e=>setForm(f=>({...f,sonraki_bakim:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}

      {bakimModal && detay && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setBakimModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">{detay.ad} — Bakım Kaydı<button onClick={()=>setBakimModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={bakimKaydet}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Tarih *</label><input type="date" className="adm-inp" required value={bakimForm.tarih} onChange={e=>setBakimForm(f=>({...f,tarih:e.target.value}))}/></div>
                <div><label className="adm-label">Maliyet (₺)</label><input type="number" step="0.01" className="adm-inp" value={bakimForm.maliyet} onChange={e=>setBakimForm(f=>({...f,maliyet:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Açıklama</label><textarea className="adm-inp" rows={2} value={bakimForm.aciklama} onChange={e=>setBakimForm(f=>({...f,aciklama:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setBakimModal(false)}>İptal</button><button type="submit" className="adm-btn">Kaydet (durumu &quot;Hazır&quot; yapar)</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
