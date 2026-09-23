'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

const TIP_LABEL: Record<string,string> = {
  uretim_giris:'Üretim Girişi', uretim_cikis:'Üretim Çıkışı', satis:'Satış', satinalma:'Satınalma',
  sevkiyat:'Sevkiyat', fire:'Fire', sayim:'Sayım', manuel_duzeltme:'Manuel Düzeltme', iade:'İade',
}

export default function StokHareketleriPage() {
  const [list, setList] = useState<any[]>([])
  const [hammaddeler, setHammaddeler] = useState<any[]>([])
  const [depolar, setDepolar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('hepsi')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ tip:'manuel_duzeltme', yon:'giris', hammadde_id:'', miktar:'', depo_id:'', aciklama:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:s},{data:h},{data:d}] = await Promise.all([
      erp.from('stok_hareketleri').select('*').order('tarih',{ascending:false}).limit(300),
      erp.from('hammaddeler').select('id,ad,birim').order('ad',{ascending:true}),
      erp.from('depolar').select('id,ad').order('ad',{ascending:true}),
    ])
    setList(s||[]); setHammaddeler(h||[]); setDepolar(d||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() { setForm({tip:'manuel_duzeltme',yon:'giris',hammadde_id:'',miktar:'',depo_id:'',aciklama:''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    await erp.from('stok_hareketleri').insert({...form, miktar:+form.miktar, depo_id:form.depo_id||null, kaynak_tablo:'manuel'})
    setModal(false); showToast('Hareket kaydedildi'); load()
  }

  const filtered = list.filter(s=>{
    if (filter!=='hepsi' && s.tip!==filter) return false
    if (search) {
      const h = hammaddeler.find((x:any)=>x.id===s.hammadde_id)
      if (!h?.ad?.toLowerCase().includes(search.toLowerCase()) && !s.aciklama?.toLowerCase().includes(search.toLowerCase())) return false
    }
    return true
  })

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Stok Hareketleri"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <select className="adm-inp" style={{width:'auto'}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="hepsi">Tüm Tipler</option>
            {Object.entries(TIP_LABEL).map(([k,l])=><option key={k} value={k}>{l}</option>)}
          </select>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Manuel Hareket / Sayım</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Hareketler ({filtered.length}) <span style={{fontSize:11,color:'var(--adm-tx3)',fontWeight:400}}>— sadece hammadde hareketleri listelenir; mamul hareketleri varyant kartlarından izlenir</span></div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Hareket bulunamadı</p>
          : filtered.map(s=>{
            const h = hammaddeler.find((x:any)=>x.id===s.hammadde_id)
            return (
              <div key={s.id} className="adm-row">
                <div style={{width:32,height:32,borderRadius:8,background:s.yon==='giris'?'var(--adm-green2)':'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {s.yon==='giris' ? <ArrowDownCircle size={15} style={{color:'var(--adm-green)'}}/> : <ArrowUpCircle size={15} style={{color:'var(--adm-red)'}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)'}}>{h?.ad || (s.variant_id?'Mamul (varyant)':'—')}</p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{TIP_LABEL[s.tip]||s.tip} · {muh.date(s.tarih)} {s.aciklama?`· ${s.aciklama}`:''}</p>
                </div>
                <span style={{fontSize:14,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:s.yon==='giris'?'var(--adm-green)':'var(--adm-red)'}}>
                  {s.yon==='giris'?'+':'-'}{muh.fmtN(s.miktar)} {h?.birim||''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Manuel Stok Hareketi / Sayım<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label className="adm-label">Hareket Tipi</label>
                  <select className="adm-inp" value={form.tip} onChange={e=>setForm(f=>({...f,tip:e.target.value}))}>
                    <option value="manuel_duzeltme">Manuel Düzeltme</option>
                    <option value="sayim">Sayım</option>
                  </select>
                </div>
                <div>
                  <label className="adm-label">Yön</label>
                  <div style={{display:'flex',gap:6}}>
                    {[['giris','Giriş'],['cikis','Çıkış']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm(f=>({...f,yon:v}))} className={form.yon===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Hammadde *</label>
                  <select className="adm-inp" required value={form.hammadde_id} onChange={e=>setForm(f=>({...f,hammadde_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {hammaddeler.map((h:any)=><option key={h.id} value={h.id}>{h.ad} ({h.birim})</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Miktar *</label><input type="number" step="0.001" className="adm-inp" required value={form.miktar} onChange={e=>setForm(f=>({...f,miktar:e.target.value}))}/></div>
                <div><label className="adm-label">Depo</label>
                  <select className="adm-inp" value={form.depo_id} onChange={e=>setForm(f=>({...f,depo_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {depolar.map((d:any)=><option key={d.id} value={d.id}>{d.ad}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Açıklama</label><textarea className="adm-inp" rows={2} value={form.aciklama} onChange={e=>setForm(f=>({...f,aciklama:e.target.value}))} placeholder="Sayım farkı, fire, düzeltme nedeni..."/></div>
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
