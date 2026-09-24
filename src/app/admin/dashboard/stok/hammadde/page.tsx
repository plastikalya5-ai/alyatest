'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, Search, AlertTriangle, Boxes, Layers } from 'lucide-react'

export default function HammaddePage() {
  const [list, setList] = useState<any[]>([])
  const [depolar, setDepolar] = useState<any[]>([])
  const [tedarikciler, setTedarikciler] = useState<any[]>([])
  const [lotlar, setLotlar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [detay, setDetay] = useState<any>(null)
  const [lotForm, setLotForm] = useState({ lot_no:'', miktar:'', giris_tarihi:new Date().toISOString().split('T')[0], tedarikci_id:'' })
  const [search, setSearch] = useState('')
  const [sadeceKritik, setSadeceKritik] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ kod:'', ad:'', aciklama:'', birim:'kg', mevcut_stok:'0', min_stok:'0', max_stok:'', ortalama_maliyet:'0', tedarikci_id:'', depo_id:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:h},{data:d},{data:c},{data:l}] = await Promise.all([
      erp.from('hammaddeler').select('*').order('ad',{ascending:true}),
      erp.from('depolar').select('id,ad').order('ad',{ascending:true}),
      muh.from('cari_hesaplar').select('id,ad').eq('tip','tedarikci').order('ad',{ascending:true}),
      erp.from('hammadde_lotlari').select('*').order('giris_tarihi',{ascending:false}),
    ])
    setList(h||[]); setDepolar(d||[]); setTedarikciler(c||[]); setLotlar(l||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({kod:'',ad:'',aciklama:'',birim:'kg',mevcut_stok:'0',min_stok:'0',max_stok:'',ortalama_maliyet:'0',tedarikci_id:'',depo_id:''}); setModal(true) }
  function openEdit(h:any) { setEditing(h); setForm({kod:h.kod,ad:h.ad,aciklama:h.aciklama||'',birim:h.birim,mevcut_stok:String(h.mevcut_stok),min_stok:String(h.min_stok),max_stok:h.max_stok?String(h.max_stok):'',ortalama_maliyet:String(h.ortalama_maliyet),tedarikci_id:h.tedarikci_id||'',depo_id:h.depo_id||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, mevcut_stok:+form.mevcut_stok, min_stok:+form.min_stok, max_stok:form.max_stok?+form.max_stok:null, ortalama_maliyet:+form.ortalama_maliyet, tedarikci_id:form.tedarikci_id||null, depo_id:form.depo_id||null}
    if (editing) await erp.from('hammaddeler').update(payload).eq('id',editing.id)
    else await erp.from('hammaddeler').insert(payload)
    setModal(false); showToast(editing?'Güncellendi':'Hammadde eklendi'); load()
  }
  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await erp.from('hammaddeler').delete().eq('id',id)
    showToast('Silindi'); load()
  }

  async function lotEkle(e:React.FormEvent) {
    e.preventDefault()
    if (!detay) return
    await erp.from('hammadde_lotlari').insert({...lotForm, miktar:+lotForm.miktar, hammadde_id:detay.id, tedarikci_id:lotForm.tedarikci_id||null})
    setLotForm({lot_no:'',miktar:'',giris_tarihi:new Date().toISOString().split('T')[0],tedarikci_id:''})
    showToast('Lot eklendi'); load()
  }
  async function lotSil(id:string) {
    if (!confirm('Lot kaydı silinsin mi?')) return
    await erp.from('hammadde_lotlari').delete().eq('id',id)
    showToast('Lot silindi'); load()
  }

  const filtered = list.filter(h=>{
    if (sadeceKritik && +h.mevcut_stok > +h.min_stok) return false
    if (search && !h.ad?.toLowerCase().includes(search.toLowerCase()) && !h.kod?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const kritikSayi = list.filter(h=>+h.mevcut_stok <= +h.min_stok).length
  const detayLotlar = detay ? lotlar.filter(l=>l.hammadde_id===detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Hammadde Yönetimi"/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-ac)',padding:'14px 16px'}}><p className="adm-kpi-label">Toplam Hammadde</p><p className="adm-kpi-value" style={{fontSize:24,color:'var(--adm-ac)'}}>{list.length}</p></div>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-red)',padding:'14px 16px'}}><p className="adm-kpi-label">Kritik Stok</p><p className="adm-kpi-value" style={{fontSize:24,color:'var(--adm-red)'}}>{kritikSayi}</p></div>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-blue)',padding:'14px 16px'}}><p className="adm-kpi-label">Toplam Değer</p><p className="adm-kpi-value" style={{fontSize:18,color:'var(--adm-blue)'}}>{muh.fmt(list.reduce((s,h)=>s+(+h.mevcut_stok*+h.ortalama_maliyet),0))}</p></div>
        </div>

        {kritikSayi>0 && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--adm-red2)',border:'1px solid var(--adm-red)',borderRadius:10,marginBottom:16,fontSize:12.5}}>
            <AlertTriangle size={15} style={{color:'var(--adm-red)',flexShrink:0}}/>
            <span><b>{kritikSayi}</b> hammadde minimum stok seviyesinin altında.</span>
          </div>
        )}

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <button onClick={()=>setSadeceKritik(k=>!k)} className={sadeceKritik?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>Sadece Kritik</button>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Hammadde Ekle</button>
        </div>

        <div className={`adm-detail-grid ${detay?'has-detail':''}`}>
        <div className="adm-card">
          <div className="adm-card-h">Hammaddeler ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Hammadde bulunamadı</p>
          : filtered.map(h=>{
            const kritik = +h.mevcut_stok <= +h.min_stok
            return (
              <div key={h.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===h.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(h)}>
                <div style={{width:36,height:36,borderRadius:9,background:kritik?'var(--adm-red2)':'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Boxes size={15} style={{color:kritik?'var(--adm-red)':'var(--adm-ac)'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{h.ad} <span style={{color:'var(--adm-tx3)',fontWeight:400,fontSize:11.5}}>({h.kod})</span></p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>Min: {muh.fmtN(h.min_stok)} {h.birim} · Maliyet: {muh.fmt(h.ortalama_maliyet)}/{h.birim}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={{fontSize:15,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:kritik?'var(--adm-red)':'var(--adm-tx)'}}>{muh.fmtN(h.mevcut_stok)} {h.birim}</p>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button className="adm-btn-ghost" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();openEdit(h)}}><Pencil size={12}/></button>
                  <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();del(h.id)}}><Trash2 size={12}/></button>
                </div>
              </div>
            )
          })}
        </div>

        {detay && (
          <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0,maxHeight:'80vh',overflow:'auto'}}>
            <div className="adm-card-h">
              <span style={{display:'flex',alignItems:'center',gap:6}}><Layers size={14}/>{detay.ad} — Lot/Parti</span>
              <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
            </div>
            <div style={{padding:16}}>
              <form onSubmit={lotEkle} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--adm-bdr)'}}>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label" style={{fontSize:10.5}}>Lot No</label><input className="adm-inp" style={{fontSize:12}} value={lotForm.lot_no} onChange={e=>setLotForm(f=>({...f,lot_no:e.target.value}))} placeholder="LOT-2026-001"/></div>
                <div><label className="adm-label" style={{fontSize:10.5}}>Miktar ({detay.birim}) *</label><input type="number" step="0.001" required className="adm-inp" style={{fontSize:12}} value={lotForm.miktar} onChange={e=>setLotForm(f=>({...f,miktar:e.target.value}))}/></div>
                <div><label className="adm-label" style={{fontSize:10.5}}>Giriş Tarihi</label><input type="date" className="adm-inp" style={{fontSize:12}} value={lotForm.giris_tarihi} onChange={e=>setLotForm(f=>({...f,giris_tarihi:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label" style={{fontSize:10.5}}>Tedarikçi</label>
                  <select className="adm-inp" style={{fontSize:12}} value={lotForm.tedarikci_id} onChange={e=>setLotForm(f=>({...f,tedarikci_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {tedarikciler.map((t:any)=><option key={t.id} value={t.id}>{t.ad}</option>)}
                  </select>
                </div>
                <button type="submit" className="adm-btn" style={{gridColumn:'1/-1',fontSize:12}}><Plus size={13}/>Lot Ekle</button>
              </form>

              {detayLotlar.length===0 ? <p style={{fontSize:12,color:'var(--adm-tx3)',textAlign:'center',padding:10}}>Henüz lot kaydı yok</p>
              : detayLotlar.map((l:any)=>{
                const t = tedarikciler.find((x:any)=>x.id===l.tedarikci_id)
                return (
                  <div key={l.id} className="adm-row" style={{padding:'8px 0'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{l.lot_no||'(Lot no yok)'}</p>
                      <p style={{fontSize:11,color:'var(--adm-tx3)'}}>{muh.date(l.giris_tarihi)} {t?`· ${t.ad}`:''}</p>
                    </div>
                    <span style={{fontSize:12.5,fontWeight:600,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-tx)'}}>{muh.fmtN(l.miktar)} {detay.birim}</span>
                    <button className="adm-btn-ghost" style={{padding:'4px 8px'}} onClick={()=>lotSil(l.id)}><Trash2 size={11}/></button>
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
            <div className="adm-modal-h">{editing?'Hammadde Düzenle':'Yeni Hammadde'}<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Kod *</label><input className="adm-inp" required value={form.kod} onChange={e=>setForm(f=>({...f,kod:e.target.value}))} placeholder="PP-GRN-01"/></div>
                <div><label className="adm-label">Ad *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="PP Granül"/></div>
                <div><label className="adm-label">Birim</label>
                  <select className="adm-inp" value={form.birim} onChange={e=>setForm(f=>({...f,birim:e.target.value}))}>
                    {['kg','gr','ton','adet','lt','mt'].map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Mevcut Stok</label><input type="number" step="0.001" className="adm-inp" value={form.mevcut_stok} onChange={e=>setForm(f=>({...f,mevcut_stok:e.target.value}))} disabled={!!editing} title={editing?'Stok, stok hareketleri ekranından güncellenir':''}/></div>
                <div><label className="adm-label">Min Stok</label><input type="number" step="0.001" className="adm-inp" value={form.min_stok} onChange={e=>setForm(f=>({...f,min_stok:e.target.value}))}/></div>
                <div><label className="adm-label">Max Stok</label><input type="number" step="0.001" className="adm-inp" value={form.max_stok} onChange={e=>setForm(f=>({...f,max_stok:e.target.value}))}/></div>
                <div><label className="adm-label">Ortalama Maliyet (₺)</label><input type="number" step="0.01" className="adm-inp" value={form.ortalama_maliyet} onChange={e=>setForm(f=>({...f,ortalama_maliyet:e.target.value}))}/></div>
                <div><label className="adm-label">Tedarikçi</label>
                  <select className="adm-inp" value={form.tedarikci_id} onChange={e=>setForm(f=>({...f,tedarikci_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {tedarikciler.map((t:any)=><option key={t.id} value={t.id}>{t.ad}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Depo</label>
                  <select className="adm-inp" value={form.depo_id} onChange={e=>setForm(f=>({...f,depo_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {depolar.map((d:any)=><option key={d.id} value={d.id}>{d.ad}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Açıklama</label><textarea className="adm-inp" rows={2} value={form.aciklama} onChange={e=>setForm(f=>({...f,aciklama:e.target.value}))}/></div>
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
