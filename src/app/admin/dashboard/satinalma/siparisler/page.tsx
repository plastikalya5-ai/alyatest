'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, PackageSearch, Search } from 'lucide-react'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  beklemede:      {l:'Beklemede',       c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
  onaylandi:      {l:'Onaylandı',       c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  yolda:          {l:'Yolda',           c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  teslim_alindi:  {l:'Teslim Alındı',   c:'var(--adm-green)', bg:'var(--adm-green2)'},
  iptal:          {l:'İptal',           c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function SatinalmaSiparisleriPage() {
  const [list, setList] = useState<any[]>([])
  const [tedarikciler, setTedarikciler] = useState<any[]>([])
  const [hammaddeler, setHammaddeler] = useState<any[]>([])
  const [kalemler, setKalemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detay, setDetay] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [siparisKalemleri, setSiparisKalemleri] = useState([{hammadde_id:'',miktar:1,birim_fiyat:0}])
  const [form, setForm] = useState({ no:`SA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, tedarikci_id:'', tarih:new Date().toISOString().split('T')[0], beklenen_teslim:'', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:s},{data:t},{data:h},{data:k}] = await Promise.all([
      erp.from('satinalma_siparisleri').select('*').order('created_at',{ascending:false}),
      muh.from('cari_hesaplar').select('id,ad').eq('tip','tedarikci').order('ad',{ascending:true}),
      erp.from('hammaddeler').select('id,ad,birim').order('ad',{ascending:true}),
      erp.from('satinalma_siparisi_kalemleri').select('*'),
    ])
    setList(s||[]); setTedarikciler(t||[]); setHammaddeler(h||[]); setKalemler(k||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() {
    setForm({no:`SA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,tedarikci_id:'',tarih:new Date().toISOString().split('T')[0],beklenen_teslim:'',notlar:''})
    setSiparisKalemleri([{hammadde_id:'',miktar:1,birim_fiyat:0}])
    setModal(true)
  }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, tedarikci_id:form.tedarikci_id||null, beklenen_teslim:form.beklenen_teslim||null}
    const { data } = await erp.from('satinalma_siparisleri').insert(payload)
    const siparisId = (data as any)?.[0]?.id
    if (siparisId) {
      const gecerli = siparisKalemleri.filter(k=>k.hammadde_id && k.miktar>0)
      await Promise.all(gecerli.map(k=>erp.from('satinalma_siparisi_kalemleri').insert({...k, siparis_id:siparisId})))
    }
    setModal(false); showToast('Sipariş oluşturuldu'); load()
  }

  async function faturaOlustur(siparisId:string) {
    const siparis = list.find(s=>s.id===siparisId)
    if (!siparis || siparis.fatura_olusturuldu) return
    const kal = kalemler.filter(k=>k.siparis_id===siparisId)
    const toplam = kal.reduce((s,k)=>s+(k.miktar*k.birim_fiyat),0)
    if (toplam<=0) return
    const { data } = await muh.from('faturalar').insert({
      no: `ALIS-${siparis.no}`, tip:'alis', cari_id: siparis.tedarikci_id, tarih: new Date().toISOString().split('T')[0],
      toplam, durum:'onaylandi', notlar: `Satınalma siparişi ${siparis.no} teslim alındı — otomatik oluşturuldu`,
    })
    const faturaId = (data as any)?.[0]?.id
    if (faturaId) {
      await Promise.all(kal.map(k=>{
        const h = hammaddeler.find((x:any)=>x.id===k.hammadde_id)
        return muh.from('fatura_kalemleri').insert({ fatura_id: faturaId, urun_adi: h?.ad||'Hammadde', miktar: k.miktar, birim_fiyat: k.birim_fiyat })
      }))
    }
    await erp.from('satinalma_siparisleri').update({fatura_olusturuldu:true}).eq('id',siparisId)
    showToast('Alış faturası otomatik oluşturuldu'); load()
  }

  async function teslimAl(kalemId:string, hammaddeId:string, miktar:number, mevcutTeslim:number) {
    const kalan = miktar - mevcutTeslim
    if (kalan<=0) return
    await erp.from('satinalma_siparisi_kalemleri').update({teslim_alinan_miktar:miktar}).eq('id',kalemId)
    await erp.from('stok_hareketleri').insert({tip:'satinalma',yon:'giris',hammadde_id:hammaddeId,miktar:kalan,kaynak_tablo:'satinalma_siparisi_kalemleri',kaynak_id:kalemId,aciklama:'Satınalma teslim alındı'})

    const siparisId = detay?.id
    const kalanlar = siparisId ? kalemler.filter(k=>k.siparis_id===siparisId && k.id!==kalemId) : []
    const hepsiTeslim = kalanlar.every(k=>k.teslim_alinan_miktar>=k.miktar)
    if (siparisId && hepsiTeslim) {
      await erp.from('satinalma_siparisleri').update({durum:'teslim_alindi'}).eq('id',siparisId)
      showToast('Teslim alındı, sipariş tamamlandı'); await load(); await faturaOlustur(siparisId)
      return
    }
    showToast('Teslim alındı, stok güncellendi'); load()
  }

  async function durumGuncelle(id:string, durum:string) {
    await erp.from('satinalma_siparisleri').update({durum}).eq('id',id)
    showToast('Durum güncellendi'); load()
    if (detay?.id===id) setDetay((d:any)=>({...d,durum}))
    if (durum==='teslim_alindi') faturaOlustur(id)
  }

  const filtered = list.filter(s=>!search || s.no?.toLowerCase().includes(search.toLowerCase()))
  const detayKalemleri = detay ? kalemler.filter(k=>k.siparis_id===detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Satınalma Siparişleri"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Sipariş no ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          <div style={{flex:1}}/>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Yeni Sipariş</button>
        </div>

        <div className={`adm-detail-grid ${detay?"has-detail":""}`}>
          <div className="adm-card">
            <div className="adm-card-h">Siparişler ({filtered.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Sipariş bulunamadı</p>
            : filtered.map(s=>{
              const d = DURUM_CONF[s.durum]||DURUM_CONF.beklemede
              const t = tedarikciler.find((x:any)=>x.id===s.tedarikci_id)
              return (
                <div key={s.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===s.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(s)}>
                  <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-blue2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <PackageSearch size={15} style={{color:'var(--adm-blue)'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{s.no}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{t?.ad||'—'} · {muh.date(s.tarih)}</p>
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
                <p style={{fontSize:12,fontWeight:600,color:'var(--adm-tx3)',marginBottom:8}}>Kalemler</p>
                {detayKalemleri.map((k:any)=>{
                  const h = hammaddeler.find((x:any)=>x.id===k.hammadde_id)
                  const tamTeslim = k.teslim_alinan_miktar >= k.miktar
                  return (
                    <div key={k.id} style={{padding:'8px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{h?.ad}</span>
                        <span style={{fontSize:12,color:'var(--adm-tx3)'}}>{k.teslim_alinan_miktar}/{k.miktar} {h?.birim}</span>
                      </div>
                      {!tamTeslim && (
                        <button className="adm-btn-ghost" style={{fontSize:11,padding:'3px 10px'}} onClick={()=>teslimAl(k.id,k.hammadde_id,k.miktar,k.teslim_alinan_miktar)}>Tümünü Teslim Al</button>
                      )}
                    </div>
                  )
                })}
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
            <div className="adm-modal-h">Yeni Satınalma Siparişi<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Sipariş No *</label><input className="adm-inp" required value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))}/></div>
                <div><label className="adm-label">Tedarikçi</label>
                  <select className="adm-inp" value={form.tedarikci_id} onChange={e=>setForm(f=>({...f,tedarikci_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {tedarikciler.map((t:any)=><option key={t.id} value={t.id}>{t.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Tarih</label><input type="date" className="adm-inp" value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))}/></div>
                <div><label className="adm-label">Beklenen Teslim</label><input type="date" className="adm-inp" value={form.beklenen_teslim} onChange={e=>setForm(f=>({...f,beklenen_teslim:e.target.value}))}/></div>

                <div style={{gridColumn:'1/-1'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <label className="adm-label" style={{margin:0}}>Kalemler</label>
                    <button type="button" className="adm-btn-ghost" style={{fontSize:11,padding:'3px 10px'}} onClick={()=>setSiparisKalemleri(k=>[...k,{hammadde_id:'',miktar:1,birim_fiyat:0}])}>+ Kalem Ekle</button>
                  </div>
                  {siparisKalemleri.map((k,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:6,marginBottom:8}}>
                      <select className="adm-inp" style={{fontSize:12}} value={k.hammadde_id} onChange={e=>{const y=[...siparisKalemleri];y[i]={...y[i],hammadde_id:e.target.value};setSiparisKalemleri(y)}}>
                        <option value="">Hammadde seç</option>
                        {hammaddeler.map((h:any)=><option key={h.id} value={h.id}>{h.ad}</option>)}
                      </select>
                      <input type="number" step="0.001" className="adm-inp" placeholder="Miktar" style={{fontSize:12}} value={k.miktar} onChange={e=>{const y=[...siparisKalemleri];y[i]={...y[i],miktar:+e.target.value};setSiparisKalemleri(y)}}/>
                      <input type="number" step="0.01" className="adm-inp" placeholder="Birim fiyat" style={{fontSize:12}} value={k.birim_fiyat} onChange={e=>{const y=[...siparisKalemleri];y[i]={...y[i],birim_fiyat:+e.target.value};setSiparisKalemleri(y)}}/>
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
