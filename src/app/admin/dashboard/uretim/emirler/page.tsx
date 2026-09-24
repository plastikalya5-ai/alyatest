'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, Factory, Search } from 'lucide-react'
import Link from 'next/link'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  planlandi:   {l:'Planlandı',   c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
  uretimde:    {l:'Üretimde',    c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  durduruldu:  {l:'Durduruldu',  c:'var(--adm-amber)', bg:'var(--adm-amber)18'},
  tamamlandi:  {l:'Tamamlandı',  c:'var(--adm-green)', bg:'var(--adm-green2)'},
  iptal:       {l:'İptal',       c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function UretimEmirleriPage() {
  const [list, setList] = useState<any[]>([])
  const [urunler, setUrunler] = useState<any[]>([])
  const [makineler, setMakineler] = useState<any[]>([])
  const [kaliplar, setKaliplar] = useState<any[]>([])
  const [receteler, setReceteler] = useState<any[]>([])
  const [siparisler, setSiparisler] = useState<any[]>([])
  const [hammaddeler, setHammaddeler] = useState<any[]>([])
  const [receteKalemleri, setReceteKalemleri] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [mrpModal, setMrpModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('hepsi')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ no:`UE-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, urun_id:'', siparis_id:'', recete_id:'', planlanan_miktar:'', makine_id:'', kalip_id:'', vardiya:'', hedef_cevrim:'', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:ue},{data:u},{data:m},{data:k},{data:r},{data:s},{data:h},{data:rk}] = await Promise.all([
      erp.from('uretim_emirleri').select('*').order('created_at',{ascending:false}),
      muh.from('products').select('id,name').order('name',{ascending:true}),
      erp.from('makineler').select('id,ad').order('ad',{ascending:true}),
      erp.from('kaliplar').select('id,ad').order('ad',{ascending:true}),
      erp.from('urun_receteleri').select('id,urun_id,versiyon').eq('aktif',true),
      erp.from('satis_siparisleri').select('id,no').order('created_at',{ascending:false}),
      erp.from('hammaddeler').select('id,ad,birim,mevcut_stok,tedarikci_id,ortalama_maliyet').order('ad',{ascending:true}),
      erp.from('recete_kalemleri').select('*'),
    ])
    setList(ue||[]); setUrunler(u||[]); setMakineler(m||[]); setKaliplar(k||[]); setReceteler(r||[]); setSiparisler(s||[]); setHammaddeler(h||[]); setReceteKalemleri(rk||[]); setLoading(false)
  },[])
  useEffect(()=>{ load() },[load])

  function openNew() {
    setForm({no:`UE-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,urun_id:'',siparis_id:'',recete_id:'',planlanan_miktar:'',makine_id:'',kalip_id:'',vardiya:'',hedef_cevrim:'',notlar:''})
    setModal(true)
  }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const payload:any = {...form, siparis_id:form.siparis_id||null, recete_id:form.recete_id||null, planlanan_miktar:+form.planlanan_miktar, makine_id:form.makine_id||null, kalip_id:form.kalip_id||null, hedef_cevrim:form.hedef_cevrim?+form.hedef_cevrim:null}
    await erp.from('uretim_emirleri').insert(payload)
    if (form.makine_id) await erp.from('makineler').update({durum:'uretimde'}).eq('id',form.makine_id)
    if (form.kalip_id) await erp.from('kaliplar').update({durum:'uretimde'}).eq('id',form.kalip_id)
    setModal(false); showToast('Üretim emri oluşturuldu'); load()
  }

  async function durumGuncelle(id:string, durum:string) {
    await erp.from('uretim_emirleri').update({durum}).eq('id',id)
    showToast('Durum güncellendi'); load()
  }

  // ---- Basit MRP: aktif üretim emirlerinin reçetesine göre hammadde ihtiyacı ----
  const ihtiyacListesi = (() => {
    const acikEmirler = list.filter(u=>['planlandi','uretimde'].includes(u.durum) && u.recete_id)
    const ihtiyac: Record<string, number> = {}
    acikEmirler.forEach(u=>{
      const kalan = Math.max(u.planlanan_miktar - u.uretilen_miktar, 0)
      receteKalemleri.filter(k=>k.recete_id===u.recete_id).forEach(k=>{
        ihtiyac[k.hammadde_id] = (ihtiyac[k.hammadde_id]||0) + k.miktar*kalan
      })
    })
    return Object.entries(ihtiyac).map(([hammadde_id, gerekli])=>{
      const h = hammaddeler.find((x:any)=>x.id===hammadde_id)
      const eksik = Math.max(gerekli - (h?.mevcut_stok||0), 0)
      return { hammadde_id, ad:h?.ad, birim:h?.birim, tedarikci_id:h?.tedarikci_id, gerekli, mevcutStok:h?.mevcut_stok||0, eksik }
    }).filter(x=>x.eksik>0)
  })()

  async function satinalmaSiparisiOlustur() {
    const gruplar: Record<string, typeof ihtiyacListesi> = {}
    ihtiyacListesi.forEach(i=>{ const key=i.tedarikci_id||'genel'; (gruplar[key]=gruplar[key]||[]).push(i) })
    for (const [tedarikciId, kalemler] of Object.entries(gruplar)) {
      const { data } = await erp.from('satinalma_siparisleri').insert({
        no: `SA-MRP-${Date.now().toString().slice(-5)}`,
        tedarikci_id: tedarikciId==='genel'?null:tedarikciId,
        tarih: new Date().toISOString().split('T')[0],
        notlar: 'Üretim ihtiyacına göre otomatik oluşturuldu (MRP)',
      })
      const siparisId = (data as any)?.[0]?.id
      if (siparisId) {
        await Promise.all(kalemler.map(k=>{
          const h = hammaddeler.find((x:any)=>x.id===k.hammadde_id)
          return erp.from('satinalma_siparisi_kalemleri').insert({
            siparis_id: siparisId, hammadde_id: k.hammadde_id, miktar: Math.ceil(k.eksik), birim_fiyat: h?.ortalama_maliyet||0,
          })
        }))
      }
    }
    setMrpModal(false); showToast('Satınalma sipariş(ler)i oluşturuldu'); load()
  }

  const filtered = list.filter(u=>{
    if (filter!=='hepsi' && u.durum!==filter) return false
    if (search && !u.no?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Üretim Emirleri"/>
      <div style={{padding:24}}>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Emir no ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          {['hepsi','planlandi','uretimde','tamamlandi'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={filter===f?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'5px 12px'}}>{DURUM_CONF[f]?.l||'Tümü'}</button>
          ))}
          <div style={{flex:1}}/>
          <Link href="/admin/dashboard/uretim/canli" className="adm-btn-ghost" style={{fontSize:12,textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>Canlı Üretim →</Link>
          <button className="adm-btn-ghost" onClick={()=>setMrpModal(true)}>Hammadde İhtiyacı{ihtiyacListesi.length>0?` (${ihtiyacListesi.length})`:''}</button>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Yeni Üretim Emri</button>
        </div>

        <div className="adm-card">
          <div className="adm-card-h">Üretim Emirleri ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Üretim emri bulunamadı</p>
          : filtered.map(u=>{
            const d = DURUM_CONF[u.durum]||DURUM_CONF.planlandi
            const urun = urunler.find((x:any)=>x.id===u.urun_id)
            const makine = makineler.find((x:any)=>x.id===u.makine_id)
            const yuzde = u.planlanan_miktar>0 ? Math.min(100,Math.round((u.uretilen_miktar/u.planlanan_miktar)*100)) : 0
            return (
              <div key={u.id} className="adm-row">
                <div style={{width:36,height:36,borderRadius:9,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Factory size={15} style={{color:d.c}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{u.no} <span style={{fontFamily:'inherit',fontWeight:400,color:'var(--adm-tx3)'}}>· {urun?.name}</span></p>
                  <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{makine?.ad||'Makine atanmadı'} · {u.uretilen_miktar}/{u.planlanan_miktar} adet (%{yuzde}) {u.fire_miktar>0?`· Fire: ${u.fire_miktar}`:''}</p>
                </div>
                <select className="adm-inp" style={{fontSize:11,padding:'4px 8px',width:'auto'}} value={u.durum} onChange={e=>durumGuncelle(u.id,e.target.value)}>
                  {Object.entries(DURUM_CONF).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
                </select>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Yeni Üretim Emri<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label className="adm-label">Emir No *</label><input className="adm-inp" required value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))}/></div>
                <div><label className="adm-label">Ürün *</label>
                  <select className="adm-inp" required value={form.urun_id} onChange={e=>setForm(f=>({...f,urun_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {urunler.map((u:any)=><option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Reçete</label>
                  <select className="adm-inp" value={form.recete_id} onChange={e=>setForm(f=>({...f,recete_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {receteler.filter((r:any)=>r.urun_id===form.urun_id).map((r:any)=><option key={r.id} value={r.id}>v{r.versiyon}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Bağlı Sipariş</label>
                  <select className="adm-inp" value={form.siparis_id} onChange={e=>setForm(f=>({...f,siparis_id:e.target.value}))}>
                    <option value="">Yok</option>
                    {siparisler.map((s:any)=><option key={s.id} value={s.id}>{s.no}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Planlanan Miktar *</label><input type="number" className="adm-inp" required value={form.planlanan_miktar} onChange={e=>setForm(f=>({...f,planlanan_miktar:e.target.value}))}/></div>
                <div><label className="adm-label">Makine</label>
                  <select className="adm-inp" value={form.makine_id} onChange={e=>setForm(f=>({...f,makine_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {makineler.map((m:any)=><option key={m.id} value={m.id}>{m.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Kalıp</label>
                  <select className="adm-inp" value={form.kalip_id} onChange={e=>setForm(f=>({...f,kalip_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {kaliplar.map((k:any)=><option key={k.id} value={k.id}>{k.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Vardiya</label><input className="adm-inp" value={form.vardiya} onChange={e=>setForm(f=>({...f,vardiya:e.target.value}))} placeholder="Gündüz / Gece"/></div>
                <div><label className="adm-label">Hedef Çevrim (sn)</label><input type="number" className="adm-inp" value={form.hedef_cevrim} onChange={e=>setForm(f=>({...f,hedef_cevrim:e.target.value}))}/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f"><button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button><button type="submit" className="adm-btn">Oluştur</button></div>
            </form>
          </div>
        </div>
      )}
      {mrpModal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setMrpModal(false)}}>
          <div className="adm-modal" style={{maxWidth:600}}>
            <div className="adm-modal-h">Hammadde İhtiyacı (Açık Üretim Emirlerine Göre)<button onClick={()=>setMrpModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <div className="adm-modal-b">
              {ihtiyacListesi.length===0 ? <p style={{padding:20,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Şu an eksik hammadde yok — tüm ihtiyaçlar stoktan karşılanabilir.</p>
              : <>
                <p style={{fontSize:12,color:'var(--adm-tx3)',marginBottom:12}}>
                  &quot;Planlandı&quot; ve &quot;Üretimde&quot; durumundaki emirlerin reçetelerine göre hesaplandı.
                </p>
                {ihtiyacListesi.map(i=>(
                  <div key={i.hammadde_id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)'}}>{i.ad}</p>
                      <p style={{fontSize:11,color:'var(--adm-tx3)'}}>Gerekli: {i.gerekli.toFixed(1)} {i.birim} · Mevcut: {i.mevcutStok} {i.birim}</p>
                    </div>
                    <span style={{fontSize:14,fontWeight:700,color:'var(--adm-red)',fontFamily:'JetBrains Mono,monospace'}}>-{i.eksik.toFixed(1)} {i.birim}</span>
                  </div>
                ))}
              </>}
            </div>
            {ihtiyacListesi.length>0 && (
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setMrpModal(false)}>Kapat</button>
                <button type="button" className="adm-btn" onClick={satinalmaSiparisiOlustur}>Satınalma Siparişi Oluştur</button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
