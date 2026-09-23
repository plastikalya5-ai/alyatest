'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, ClipboardList, Search } from 'lucide-react'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  beklemede:     {l:'Beklemede',      c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
  uretimde:      {l:'Üretimde',       c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  kismen_hazir:  {l:'Kısmen Hazır',   c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  hazir:         {l:'Hazır',          c:'var(--adm-green)', bg:'var(--adm-green2)'},
  sevk_edildi:   {l:'Sevk Edildi',    c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  tamamlandi:    {l:'Tamamlandı',     c:'var(--adm-green)', bg:'var(--adm-green2)'},
  iptal:         {l:'İptal',          c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function SatisSiparisleriPage() {
  const [list, setList] = useState<any[]>([])
  const [cariList, setCariList] = useState<any[]>([])
  const [variantlar, setVariantlar] = useState<any[]>([])
  const [kalemler, setKalemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detay, setDetay] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [siparisKalemleri, setSiparisKalemleri] = useState([{variant_id:'',urun_adi:'',miktar:1,birim_fiyat:0}])
  const [form, setForm] = useState({ no:`SS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, cari_id:'', tarih:new Date().toISOString().split('T')[0], teslim_tarihi:'', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:s},{data:c},{data:v},{data:k}] = await Promise.all([
      erp.from('satis_siparisleri').select('*').order('created_at',{ascending:false}),
      muh.from('cari_hesaplar').select('id,ad').order('ad',{ascending:true}),
      muh.from('product_variants').select('id,name,product_id,stock').order('name',{ascending:true}),
      erp.from('satis_siparisi_kalemleri').select('*'),
    ])
    setList(s||[]); setCariList(c||[]); setVariantlar(v||[]); setKalemler(k||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() {
    setForm({no:`SS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,cari_id:'',tarih:new Date().toISOString().split('T')[0],teslim_tarihi:'',notlar:''})
    setSiparisKalemleri([{variant_id:'',urun_adi:'',miktar:1,birim_fiyat:0}])
    setModal(true)
  }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, cari_id:form.cari_id||null, teslim_tarihi:form.teslim_tarihi||null}
    const { data } = await erp.from('satis_siparisleri').insert(payload)
    const siparisId = (data as any)?.[0]?.id
    if (siparisId) {
      const gecerli = siparisKalemleri.filter(k=>k.urun_adi && k.miktar>0)
      await Promise.all(gecerli.map(k=>erp.from('satis_siparisi_kalemleri').insert({...k, variant_id:k.variant_id||null, siparis_id:siparisId})))
    }
    setModal(false); showToast('Sipariş oluşturuldu'); load()
  }

  async function durumGuncelle(id:string, durum:string) {
    await erp.from('satis_siparisleri').update({durum}).eq('id',id)
    showToast('Durum güncellendi'); load()
    if (detay?.id===id) setDetay((d:any)=>({...d,durum}))
  }

  const filtered = list.filter(s=>!search || s.no?.toLowerCase().includes(search.toLowerCase()))
  const detayKalemleri = detay ? kalemler.filter(k=>k.siparis_id===detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Satış Siparişleri"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Sipariş no ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Yeni Sipariş</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:detay?'1fr 380px':'1fr',gap:16}}>
          <div className="adm-card">
            <div className="adm-card-h">Siparişler ({filtered.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Sipariş bulunamadı</p>
            : filtered.map(s=>{
              const d = DURUM_CONF[s.durum]||DURUM_CONF.beklemede
              const cari = cariList.find((c:any)=>c.id===s.cari_id)
              return (
                <div key={s.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===s.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(s)}>
                  <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <ClipboardList size={15} style={{color:'var(--adm-ac)'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{s.no}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{cari?.ad||'—'} · {muh.date(s.tarih)}</p>
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
                <p style={{fontSize:12,fontWeight:600,color:'var(--adm-tx3)',marginBottom:8}}>Kalemler (Stok Karşılama)</p>
                {detayKalemleri.map((k:any)=>(
                  <div key={k.id} style={{padding:'8px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{k.urun_adi}</span>
                      <span style={{fontSize:12,color:'var(--adm-tx3)'}}>{k.miktar} adet</span>
                    </div>
                    <div style={{display:'flex',gap:10,fontSize:11}}>
                      <span style={{color:'var(--adm-green)'}}>Stoktan: {k.karsilanan_miktar}</span>
                      {k.uretim_gereken_miktar>0 && <span style={{color:'var(--adm-amber)'}}>Üretim Gerekli: {k.uretim_gereken_miktar}</span>}
                    </div>
                  </div>
                ))}
                <p style={{fontSize:12,color:'var(--adm-tx3)',marginTop:14,marginBottom:8}}>Durum Değiştir:</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {Object.entries(DURUM_CONF).map(([k,v])=>(
                    <button key={k} onClick={()=>durumGuncelle(detay.id,k)} className={detay.durum===k?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'4px 10px'}}>{v.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal" style={{maxWidth:640}}>
            <div className="adm-modal-h">Yeni Satış Siparişi<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Sipariş No *</label><input className="adm-inp" required value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))}/></div>
                <div><label className="adm-label">Cari</label>
                  <select className="adm-inp" value={form.cari_id} onChange={e=>setForm(f=>({...f,cari_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {cariList.map((c:any)=><option key={c.id} value={c.id}>{c.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Tarih</label><input type="date" className="adm-inp" value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))}/></div>
                <div><label className="adm-label">Teslim Tarihi</label><input type="date" className="adm-inp" value={form.teslim_tarihi} onChange={e=>setForm(f=>({...f,teslim_tarihi:e.target.value}))}/></div>

                <div style={{gridColumn:'1/-1'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <label className="adm-label" style={{margin:0}}>Kalemler</label>
                    <button type="button" className="adm-btn-ghost" style={{fontSize:11,padding:'3px 10px'}} onClick={()=>setSiparisKalemleri(k=>[...k,{variant_id:'',urun_adi:'',miktar:1,birim_fiyat:0}])}>+ Kalem Ekle</button>
                  </div>
                  {siparisKalemleri.map((k,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:6,marginBottom:8}}>
                      <select className="adm-inp" style={{fontSize:12}} value={k.variant_id} onChange={e=>{
                        const v = variantlar.find((x:any)=>x.id===e.target.value)
                        const y=[...siparisKalemleri]; y[i]={...y[i],variant_id:e.target.value,urun_adi:v?.name||y[i].urun_adi}; setSiparisKalemleri(y)
                      }}>
                        <option value="">Varyant seç (opsiyonel)</option>
                        {variantlar.map((v:any)=><option key={v.id} value={v.id}>{v.name} (stok: {v.stock})</option>)}
                      </select>
                      <input className="adm-inp" placeholder="Ürün adı" style={{fontSize:12}} value={k.urun_adi} onChange={e=>{const y=[...siparisKalemleri];y[i]={...y[i],urun_adi:e.target.value};setSiparisKalemleri(y)}}/>
                      <input type="number" className="adm-inp" placeholder="Miktar" style={{fontSize:12}} value={k.miktar} onChange={e=>{const y=[...siparisKalemleri];y[i]={...y[i],miktar:+e.target.value};setSiparisKalemleri(y)}}/>
                      <button type="button" onClick={()=>setSiparisKalemleri(k=>k.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-red)'}} disabled={siparisKalemleri.length===1}><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Sipariş Oluştur</button></div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
