'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, Truck, Search, Globe } from 'lucide-react'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  hazirlaniyor:  {l:'Hazırlanıyor', c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
  yola_cikti:    {l:'Yola Çıktı',   c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  teslim_edildi: {l:'Teslim Edildi',c:'var(--adm-green)', bg:'var(--adm-green2)'},
  iptal:         {l:'İptal',        c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function SevkiyatPage() {
  const [list, setList] = useState<any[]>([])
  const [siparisler, setSiparisler] = useState<any[]>([])
  const [cariList, setCariList] = useState<any[]>([])
  const [ihracatlar, setIhracatlar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [ihracatModal, setIhracatModal] = useState(false)
  const [detay, setDetay] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ no:`SV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, siparis_id:'', cari_id:'', tarih:new Date().toISOString().split('T')[0], koli_sayisi:'', toplam_urun_adedi:'', net_agirlik:'', brut_agirlik:'', toplam_m3:'', palet_sayisi:'', kargo_firmasi:'', takip_no:'' })
  const [ihracatForm, setIhracatForm] = useState({ ulke:'', para_birimi:'USD', kur:'1', incoterm:'', konteyner_no:'', gumruk_beyan_no:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:s},{data:sp},{data:c},{data:ih}] = await Promise.all([
      erp.from('sevkiyatlar').select('*').order('created_at',{ascending:false}),
      erp.from('satis_siparisleri').select('id,no').order('created_at',{ascending:false}),
      muh.from('cari_hesaplar').select('id,ad').order('ad',{ascending:true}),
      erp.from('ihracat_detaylari').select('*'),
    ])
    setList(s||[]); setSiparisler(sp||[]); setCariList(c||[]); setIhracatlar(ih||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() {
    setForm({no:`SV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,siparis_id:'',cari_id:'',tarih:new Date().toISOString().split('T')[0],koli_sayisi:'',toplam_urun_adedi:'',net_agirlik:'',brut_agirlik:'',toplam_m3:'',palet_sayisi:'',kargo_firmasi:'',takip_no:''})
    setModal(true)
  }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const num = (v:string)=>v?+v:0
    const payload:any = {...form, siparis_id:form.siparis_id||null, cari_id:form.cari_id||null,
      koli_sayisi:num(form.koli_sayisi), toplam_urun_adedi:num(form.toplam_urun_adedi), net_agirlik:num(form.net_agirlik),
      brut_agirlik:num(form.brut_agirlik), toplam_m3:num(form.toplam_m3), palet_sayisi:num(form.palet_sayisi)}
    await erp.from('sevkiyatlar').insert(payload)
    setModal(false); showToast('Sevkiyat oluşturuldu'); load()
  }

  async function durumGuncelle(id:string, durum:string) {
    await erp.from('sevkiyatlar').update({durum}).eq('id',id)
    showToast('Durum güncellendi'); load()
    if (detay?.id===id) setDetay((d:any)=>({...d,durum}))
  }

  async function ihracatKaydet(e:React.FormEvent) {
    e.preventDefault()
    if (!detay) return
    await erp.from('ihracat_detaylari').insert({...ihracatForm, kur:+ihracatForm.kur, sevkiyat_id:detay.id, toplam_koli:detay.koli_sayisi, toplam_m3:detay.toplam_m3, net_agirlik:detay.net_agirlik, brut_agirlik:detay.brut_agirlik})
    setIhracatModal(false); showToast('İhracat detayı eklendi'); load()
  }

  const filtered = list.filter(s=>!search || s.no?.toLowerCase().includes(search.toLowerCase()))
  const detayIhracat = detay ? ihracatlar.find(i=>i.sevkiyat_id===detay.id) : null

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Sevkiyat / İhracat"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Sevkiyat no ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Yeni Sevkiyat</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:detay?'1fr 380px':'1fr',gap:16}}>
          <div className="adm-card">
            <div className="adm-card-h">Sevkiyatlar ({filtered.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Sevkiyat bulunamadı</p>
            : filtered.map(s=>{
              const d = DURUM_CONF[s.durum]||DURUM_CONF.hazirlaniyor
              const cari = cariList.find((c:any)=>c.id===s.cari_id)
              const ihr = ihracatlar.find(i=>i.sevkiyat_id===s.id)
              return (
                <div key={s.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===s.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(s)}>
                  <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Truck size={15} style={{color:'var(--adm-ac)'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{s.no} {ihr && <Globe size={11} style={{display:'inline',color:'var(--adm-blue)',marginLeft:4}}/>}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{cari?.ad||'—'} · {s.koli_sayisi} koli · {muh.fmtN(s.net_agirlik)}kg</p>
                  </div>
                  <span className="adm-badge" style={{background:d.bg,color:d.c}}>{d.l}</span>
                </div>
              )
            })}
          </div>

          {detay && (
            <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0}}>
              <div className="adm-card-h">
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:13}}>{detay.no}</span>
                <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
              </div>
              <div style={{padding:20}}>
                {[
                  {l:'Koli Sayısı', v:detay.koli_sayisi},
                  {l:'Ürün Adedi', v:detay.toplam_urun_adedi},
                  {l:'Net Ağırlık', v:`${muh.fmtN(detay.net_agirlik)} kg`},
                  {l:'Brüt Ağırlık', v:`${muh.fmtN(detay.brut_agirlik)} kg`},
                  {l:'Hacim', v:`${muh.fmtN(detay.toplam_m3)} m³`},
                  {l:'Palet', v:detay.palet_sayisi},
                  {l:'Kargo', v:detay.kargo_firmasi||'—'},
                ].map(r=>(
                  <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                    <span style={{fontSize:12.5,color:'var(--adm-tx3)'}}>{r.l}</span>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)'}}>{r.v}</span>
                  </div>
                ))}
                <p style={{fontSize:12,color:'var(--adm-tx3)',margin:'14px 0 8px'}}>Durum:</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                  {Object.entries(DURUM_CONF).map(([k,v])=>(
                    <button key={k} onClick={()=>durumGuncelle(detay.id,k)} className={detay.durum===k?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'4px 10px'}}>{v.l}</button>
                  ))}
                </div>
                {detayIhracat ? (
                  <div style={{padding:10,background:'var(--adm-blue2)',borderRadius:8}}>
                    <p style={{fontSize:12,fontWeight:700,color:'var(--adm-blue)',marginBottom:6}}><Globe size={12} style={{display:'inline',marginRight:4}}/>İhracat: {detayIhracat.ulke}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{detayIhracat.incoterm} · {detayIhracat.para_birimi} (kur:{detayIhracat.kur}) {detayIhracat.konteyner_no?`· Konteyner: ${detayIhracat.konteyner_no}`:''}</p>
                  </div>
                ) : (
                  <button className="adm-btn-ghost" style={{width:'100%'}} onClick={()=>{setIhracatForm({ulke:'',para_birimi:'USD',kur:'1',incoterm:'',konteyner_no:'',gumruk_beyan_no:''});setIhracatModal(true)}}><Globe size={13}/>İhracat Detayı Ekle</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal" style={{maxWidth:640}}>
            <div className="adm-modal-h">Yeni Sevkiyat<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Sevkiyat No *</label><input className="adm-inp" required value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))}/></div>
                <div><label className="adm-label">Bağlı Sipariş</label>
                  <select className="adm-inp" value={form.siparis_id} onChange={e=>setForm(f=>({...f,siparis_id:e.target.value}))}>
                    <option value="">Yok</option>
                    {siparisler.map((s:any)=><option key={s.id} value={s.id}>{s.no}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Cari</label>
                  <select className="adm-inp" value={form.cari_id} onChange={e=>setForm(f=>({...f,cari_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {cariList.map((c:any)=><option key={c.id} value={c.id}>{c.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Tarih</label><input type="date" className="adm-inp" value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))}/></div>
                <div><label className="adm-label">Koli Sayısı</label><input type="number" className="adm-inp" value={form.koli_sayisi} onChange={e=>setForm(f=>({...f,koli_sayisi:e.target.value}))}/></div>
                <div><label className="adm-label">Ürün Adedi</label><input type="number" className="adm-inp" value={form.toplam_urun_adedi} onChange={e=>setForm(f=>({...f,toplam_urun_adedi:e.target.value}))}/></div>
                <div><label className="adm-label">Net Ağırlık (kg)</label><input type="number" step="0.01" className="adm-inp" value={form.net_agirlik} onChange={e=>setForm(f=>({...f,net_agirlik:e.target.value}))}/></div>
                <div><label className="adm-label">Brüt Ağırlık (kg)</label><input type="number" step="0.01" className="adm-inp" value={form.brut_agirlik} onChange={e=>setForm(f=>({...f,brut_agirlik:e.target.value}))}/></div>
                <div><label className="adm-label">Hacim (m³)</label><input type="number" step="0.01" className="adm-inp" value={form.toplam_m3} onChange={e=>setForm(f=>({...f,toplam_m3:e.target.value}))}/></div>
                <div><label className="adm-label">Palet Sayısı</label><input type="number" className="adm-inp" value={form.palet_sayisi} onChange={e=>setForm(f=>({...f,palet_sayisi:e.target.value}))}/></div>
                <div><label className="adm-label">Kargo Firması</label><input className="adm-inp" value={form.kargo_firmasi} onChange={e=>setForm(f=>({...f,kargo_firmasi:e.target.value}))}/></div>
                <div><label className="adm-label">Takip No</label><input className="adm-inp" value={form.takip_no} onChange={e=>setForm(f=>({...f,takip_no:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Oluştur</button></div>
            </form>
          </div>
        </div>
      )}

      {ihracatModal && detay && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setIhracatModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">{detay.no} — İhracat Detayı<button onClick={()=>setIhracatModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={ihracatKaydet}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Ülke *</label><input className="adm-inp" required value={ihracatForm.ulke} onChange={e=>setIhracatForm(f=>({...f,ulke:e.target.value}))}/></div>
                <div><label className="adm-label">Para Birimi</label>
                  <select className="adm-inp" value={ihracatForm.para_birimi} onChange={e=>setIhracatForm(f=>({...f,para_birimi:e.target.value}))}>
                    {['USD','EUR','GBP','TRY'].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Kur</label><input type="number" step="0.0001" className="adm-inp" value={ihracatForm.kur} onChange={e=>setIhracatForm(f=>({...f,kur:e.target.value}))}/></div>
                <div><label className="adm-label">Incoterm</label><input className="adm-inp" value={ihracatForm.incoterm} onChange={e=>setIhracatForm(f=>({...f,incoterm:e.target.value}))} placeholder="FOB / CIF / EXW"/></div>
                <div><label className="adm-label">Konteyner No</label><input className="adm-inp" value={ihracatForm.konteyner_no} onChange={e=>setIhracatForm(f=>({...f,konteyner_no:e.target.value}))}/></div>
                <div><label className="adm-label">Gümrük Beyan No</label><input className="adm-inp" value={ihracatForm.gumruk_beyan_no} onChange={e=>setIhracatForm(f=>({...f,gumruk_beyan_no:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setIhracatModal(false)}>İptal</button><button type="submit" className="adm-btn">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
