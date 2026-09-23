'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, FlameKindling, Search } from 'lucide-react'

export default function FirePage() {
  const [list, setList] = useState<any[]>([])
  const [makineler, setMakineler] = useState<any[]>([])
  const [hammaddeler, setHammaddeler] = useState<any[]>([])
  const [emirler, setEmirler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ uretim_emri_id:'', makine_id:'', hammadde_id:'', miktar:'', birim:'adet', fire_nedeni:'', maliyet_etkisi:'0' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:f},{data:m},{data:h},{data:ue}] = await Promise.all([
      erp.from('fire_kayitlari').select('*').order('tarih',{ascending:false}),
      erp.from('makineler').select('id,ad').order('ad',{ascending:true}),
      erp.from('hammaddeler').select('id,ad').order('ad',{ascending:true}),
      erp.from('uretim_emirleri').select('id,no').order('created_at',{ascending:false}),
    ])
    setList(f||[]); setMakineler(m||[]); setHammaddeler(h||[]); setEmirler(ue||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setForm({uretim_emri_id:'',makine_id:'',hammadde_id:'',miktar:'',birim:'adet',fire_nedeni:'',maliyet_etkisi:'0'}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, uretim_emri_id:form.uretim_emri_id||null, makine_id:form.makine_id||null, hammadde_id:form.hammadde_id||null, miktar:+form.miktar, maliyet_etkisi:+form.maliyet_etkisi}
    await erp.from('fire_kayitlari').insert(payload)
    if (form.hammadde_id) {
      await erp.from('stok_hareketleri').insert({tip:'fire',yon:'cikis',hammadde_id:form.hammadde_id,miktar:+form.miktar,kaynak_tablo:'fire_kayitlari',aciklama:form.fire_nedeni})
    }
    setModal(false); showToast('Fire kaydedildi'); load()
  }

  const filtered = list.filter(f=>!search || f.fire_nedeni?.toLowerCase().includes(search.toLowerCase()))
  const toplamMaliyet = list.reduce((s,f)=>s+(+f.maliyet_etkisi||0),0)

  const nedenGruplari = Object.entries(
    list.reduce<Record<string,number>>((acc,f)=>{ acc[f.fire_nedeni]=(acc[f.fire_nedeni]||0)+(+f.miktar); return acc },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Fire Yönetimi"/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:20}}>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-red)',padding:'14px 16px'}}><p className="adm-kpi-label">Toplam Fire Kaydı</p><p className="adm-kpi-value" style={{fontSize:24,color:'var(--adm-red)'}}>{list.length}</p></div>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-amber)',padding:'14px 16px'}}><p className="adm-kpi-label">Toplam Maliyet Etkisi</p><p className="adm-kpi-value" style={{fontSize:20,color:'var(--adm-amber)'}}>{muh.fmt(toplamMaliyet)}</p></div>
        </div>

        {nedenGruplari.length>0 && (
          <div className="adm-card" style={{marginBottom:20}}>
            <div className="adm-card-h">En Sık Fire Nedenleri</div>
            <div style={{padding:16}}>
              {nedenGruplari.map(([neden,miktar])=>(
                <div key={neden} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                  <span style={{fontSize:12.5,color:'var(--adm-tx)'}}>{neden||'Belirtilmemiş'}</span>
                  <span style={{fontSize:12.5,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-red)'}}>{muh.fmtN(miktar)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Neden ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Fire Kaydı Ekle</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Fire Kayıtları ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Kayıt bulunamadı</p>
          : filtered.map(f=>{
            const m = makineler.find((x:any)=>x.id===f.makine_id)
            const h = hammaddeler.find((x:any)=>x.id===f.hammadde_id)
            const ue = emirler.find((x:any)=>x.id===f.uretim_emri_id)
            return (
              <div key={f.id} className="adm-row">
                <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <FlameKindling size={15} style={{color:'var(--adm-red)'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)'}}>{f.fire_nedeni}</p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{h?.ad||m?.ad||ue?.no||'—'} · {muh.date(f.tarih)}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={{fontSize:14,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-red)'}}>{muh.fmtN(f.miktar)} {f.birim}</p>
                  {f.maliyet_etkisi>0 && <p style={{fontSize:11,color:'var(--adm-amber)'}}>{muh.fmt(f.maliyet_etkisi)}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Yeni Fire Kaydı<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Üretim Emri</label>
                  <select className="adm-inp" value={form.uretim_emri_id} onChange={e=>setForm(f=>({...f,uretim_emri_id:e.target.value}))}>
                    <option value="">Yok</option>
                    {emirler.map((e:any)=><option key={e.id} value={e.id}>{e.no}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Makine</label>
                  <select className="adm-inp" value={form.makine_id} onChange={e=>setForm(f=>({...f,makine_id:e.target.value}))}>
                    <option value="">Yok</option>
                    {makineler.map((m:any)=><option key={m.id} value={m.id}>{m.ad}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Hammadde (opsiyonel — stoktan düşer)</label>
                  <select className="adm-inp" value={form.hammadde_id} onChange={e=>setForm(f=>({...f,hammadde_id:e.target.value}))}>
                    <option value="">Yok</option>
                    {hammaddeler.map((h:any)=><option key={h.id} value={h.id}>{h.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Miktar *</label><input type="number" step="0.001" className="adm-inp" required value={form.miktar} onChange={e=>setForm(f=>({...f,miktar:e.target.value}))}/></div>
                <div><label className="adm-label">Birim</label>
                  <select className="adm-inp" value={form.birim} onChange={e=>setForm(f=>({...f,birim:e.target.value}))}>
                    {['adet','kg','gr'].map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Fire Nedeni *</label><input className="adm-inp" required value={form.fire_nedeni} onChange={e=>setForm(f=>({...f,fire_nedeni:e.target.value}))} placeholder="Renk hatası, çapak, kırık..."/></div>
                <div><label className="adm-label">Maliyet Etkisi (₺)</label><input type="number" step="0.01" className="adm-inp" value={form.maliyet_etkisi} onChange={e=>setForm(f=>({...f,maliyet_etkisi:e.target.value}))}/></div>
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
