'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, ShieldCheck, Search } from 'lucide-react'

const SONUC_CONF: Record<string,{l:string;c:string;bg:string}> = {
  uygun:         {l:'Uygun',         c:'var(--adm-green)', bg:'var(--adm-green2)'},
  sartli_uygun:  {l:'Şartlı Uygun',  c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  red:           {l:'Red',           c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function KaliteKontrolPage() {
  const [list, setList] = useState<any[]>([])
  const [urunler, setUrunler] = useState<any[]>([])
  const [emirler, setEmirler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ urun_id:'', uretim_emri_id:'', kontrol_tipi:'son_kontrol', sonuc:'uygun', kontrol_edilen_adet:'', uygun_adet:'', red_adet:'0', red_nedeni:'', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:kk},{data:u},{data:ue}] = await Promise.all([
      erp.from('kalite_kontrol_kayitlari').select('*').order('tarih',{ascending:false}),
      muh.from('products').select('id,name').order('name',{ascending:true}),
      erp.from('uretim_emirleri').select('id,no').order('created_at',{ascending:false}),
    ])
    setList(kk||[]); setUrunler(u||[]); setEmirler(ue||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setForm({urun_id:'',uretim_emri_id:'',kontrol_tipi:'son_kontrol',sonuc:'uygun',kontrol_edilen_adet:'',uygun_adet:'',red_adet:'0',red_nedeni:'',notlar:''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, urun_id:form.urun_id||null, uretim_emri_id:form.uretim_emri_id||null,
      kontrol_edilen_adet:+form.kontrol_edilen_adet, uygun_adet:+form.uygun_adet, red_adet:+form.red_adet}
    await erp.from('kalite_kontrol_kayitlari').insert(payload)
    setModal(false); showToast('Kayıt eklendi'); load()
  }

  const filtered = list.filter(k=>!search || k.red_nedeni?.toLowerCase().includes(search.toLowerCase()))
  const uygunOrani = list.length ? Math.round((list.filter(k=>k.sonuc==='uygun').length/list.length)*100) : 0

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Kalite Kontrol"/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-ac)',padding:'14px 16px'}}><p className="adm-kpi-label">Toplam Kontrol</p><p className="adm-kpi-value" style={{fontSize:22,color:'var(--adm-ac)'}}>{list.length}</p></div>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-green)',padding:'14px 16px'}}><p className="adm-kpi-label">Uygun Oranı</p><p className="adm-kpi-value" style={{fontSize:22,color:'var(--adm-green)'}}>%{uygunOrani}</p></div>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-amber)',padding:'14px 16px'}}><p className="adm-kpi-label">Şartlı Uygun</p><p className="adm-kpi-value" style={{fontSize:22,color:'var(--adm-amber)'}}>{list.filter(k=>k.sonuc==='sartli_uygun').length}</p></div>
          <div className="adm-kpi" style={{borderLeft:'2.5px solid var(--adm-red)',padding:'14px 16px'}}><p className="adm-kpi-label">Red</p><p className="adm-kpi-value" style={{fontSize:22,color:'var(--adm-red)'}}>{list.filter(k=>k.sonuc==='red').length}</p></div>
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Red nedeni ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Kontrol Kaydı Ekle</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Kontrol Kayıtları ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Kayıt bulunamadı</p>
          : filtered.map(k=>{
            const s = SONUC_CONF[k.sonuc]||SONUC_CONF.uygun
            const urun = urunler.find((u:any)=>u.id===k.urun_id)
            const emir = emirler.find((e:any)=>e.id===k.uretim_emri_id)
            return (
              <div key={k.id} className="adm-row">
                <div style={{width:36,height:36,borderRadius:9,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <ShieldCheck size={15} style={{color:s.c}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)'}}>{urun?.name||'—'} {emir && <span style={{fontWeight:400,color:'var(--adm-tx3)',fontFamily:'JetBrains Mono,monospace',fontSize:11}}>· {emir.no}</span>}</p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{k.kontrol_tipi.replace('_',' ')} · {muh.date(k.tarih)} · {k.kontrol_edilen_adet} kontrol edildi {k.red_adet>0?`· ${k.red_adet} red`:''}</p>
                </div>
                <span className="adm-badge" style={{background:s.bg,color:s.c}}>{s.l}</span>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Yeni Kalite Kontrol Kaydı<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Ürün</label>
                  <select className="adm-inp" value={form.urun_id} onChange={e=>setForm(f=>({...f,urun_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {urunler.map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Üretim Emri</label>
                  <select className="adm-inp" value={form.uretim_emri_id} onChange={e=>setForm(f=>({...f,uretim_emri_id:e.target.value}))}>
                    <option value="">Yok</option>
                    {emirler.map((e:any)=><option key={e.id} value={e.id}>{e.no}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Kontrol Tipi</label>
                  <select className="adm-inp" value={form.kontrol_tipi} onChange={e=>setForm(f=>({...f,kontrol_tipi:e.target.value}))}>
                    <option value="giris_kontrol">Giriş Kontrol</option>
                    <option value="proses_kontrol">Proses Kontrol</option>
                    <option value="son_kontrol">Son Kontrol</option>
                  </select>
                </div>
                <div><label className="adm-label">Sonuç</label>
                  <select className="adm-inp" value={form.sonuc} onChange={e=>setForm(f=>({...f,sonuc:e.target.value}))}>
                    {Object.entries(SONUC_CONF).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Kontrol Edilen Adet *</label><input type="number" className="adm-inp" required value={form.kontrol_edilen_adet} onChange={e=>setForm(f=>({...f,kontrol_edilen_adet:e.target.value}))}/></div>
                <div><label className="adm-label">Uygun Adet</label><input type="number" className="adm-inp" value={form.uygun_adet} onChange={e=>setForm(f=>({...f,uygun_adet:e.target.value}))}/></div>
                <div><label className="adm-label">Red Adet</label><input type="number" className="adm-inp" value={form.red_adet} onChange={e=>setForm(f=>({...f,red_adet:e.target.value}))}/></div>
                <div><label className="adm-label">Red Nedeni</label><input className="adm-inp" value={form.red_nedeni} onChange={e=>setForm(f=>({...f,red_nedeni:e.target.value}))}/></div>
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
