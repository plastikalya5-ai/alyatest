'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Plus, X, FileText, Search, Download, Eye, RefreshCw } from 'lucide-react'
import { erp } from '@/lib/erp-client'

const DURUM_CONF: Record<string,{l:string;c:string;bg:string}> = {
  taslak:    {l:'Taslak',     c:'var(--adm-tx3)',   bg:'var(--adm-s3)'},
  onaylandi: {l:'Onaylandı',  c:'var(--adm-blue)',  bg:'var(--adm-blue2)'},
  odendi:    {l:'Ödendi',     c:'var(--adm-green)', bg:'var(--adm-green2)'},
  iptal:     {l:'İptal',      c:'var(--adm-red)',   bg:'var(--adm-red2)'},
}

export default function FaturalarPage() {
  const [faturalar, setFaturalar] = useState<any[]>([])
  const [cariList, setCariList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detay, setDetay] = useState<any>(null)
  const [filter, setFilter] = useState('hepsi')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [pageSize, setPageSize] = useState(200)
  const [kasaListesi, setKasaListesi] = useState<any[]>([])
  const [dovizModal, setDovizModal] = useState(false)
  const [dovizForm, setDovizForm] = useState({ kur:'', kasa_hesap_id:'' })
  const [kalemleri, setKalemleri] = useState([{urun_adi:'',miktar:1,birim:'adet',birim_fiyat:0,kdv_orani:20,toplam:0}])
  const [form, setForm] = useState({
    tip:'satis', no:`F-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    cari_id:'', tarih:new Date().toISOString().split('T')[0], vade:'', kdv_orani:20, notlar:'',
    para_birimi:'TRY', kur:'1',
  })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:f},{data:c},{data:k}] = await Promise.all([
      muh.from('faturalar').select('*').order('created_at',{ascending:false}).limit(pageSize),
      muh.from('cari_hesaplar').select('id,ad,tip').order('ad',{ascending:true}),
      erp.from('kasa_banka_hesaplari').select('id,ad').order('ad',{ascending:true}),
    ])
    setFaturalar(f||[]); setCariList(c||[]); setKasaListesi(k||[]); setLoading(false)
  },[pageSize])

  useEffect(()=>{ load() },[load])

  async function yazdir(fatura:any) {
    const { data: kalem } = await muh.from('fatura_kalemleri').select('*').eq('fatura_id',fatura.id)
    const cari = cariList.find((c:any)=>c.id===fatura.cari_id)
    const satirlar = (kalem||[]).map((k:any)=>`
      <tr>
        <td>${k.urun_adi||''}</td>
        <td style="text-align:right">${k.miktar} ${k.birim||'adet'}</td>
        <td style="text-align:right">${muh.fmt(k.birim_fiyat)}</td>
        <td style="text-align:right">%${k.kdv_orani ?? 20}</td>
        <td style="text-align:right">${muh.fmt(k.toplam ?? (k.miktar*k.birim_fiyat*(1+(k.kdv_orani??20)/100)))}</td>
      </tr>`).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${fatura.no}</title>
      <style>
        body{font-family:Arial,sans-serif;color:#0b0e0b;padding:40px;max-width:800px;margin:0 auto}
        h1{font-size:20px;margin:0 0 4px}
        .muted{color:#6b7366;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        th,td{padding:8px 6px;font-size:13px;border-bottom:1px solid #ddd;text-align:left}
        th{color:#6b7366;font-size:11px;text-transform:uppercase}
        .toplam{margin-top:16px;text-align:right;font-size:15px;font-weight:700}
        .header{display:flex;justify-content:space-between;border-bottom:2px solid #e55f28;padding-bottom:16px;margin-bottom:16px}
        @media print{body{padding:0}}
      </style></head>
      <body>
        <div class="header">
          <div><h1>ALYA PLASTİK</h1><p class="muted">Fatura</p></div>
          <div style="text-align:right"><h1>${fatura.no}</h1><p class="muted">${muh.date(fatura.tarih)} ${fatura.vade?`· Vade: ${muh.date(fatura.vade)}`:''}</p></div>
        </div>
        <p><b>${fatura.tip==='satis'?'Müşteri':'Tedarikçi'}:</b> ${cari?.ad||'—'}</p>
        <table>
          <thead><tr><th>Ürün</th><th style="text-align:right">Miktar</th><th style="text-align:right">Birim Fiyat</th><th style="text-align:right">KDV</th><th style="text-align:right">Toplam</th></tr></thead>
          <tbody>${satirlar}</tbody>
        </table>
        <div class="toplam">
          <p class="muted">Ara Toplam: ${muh.fmt(fatura.ara_toplam)}</p>
          <p class="muted">KDV: ${muh.fmt(fatura.kdv_tutari)}</p>
          <p>Genel Toplam: ${muh.fmt(fatura.toplam)}</p>
          ${fatura.para_birimi && fatura.para_birimi!=='TRY' ? `<p class="muted">(${(+fatura.doviz_tutari||0).toFixed(2)} ${fatura.para_birimi} × kur ${fatura.kur})</p>` : ''}
        </div>
        ${fatura.notlar?`<p class="muted" style="margin-top:24px">${fatura.notlar}</p>`:''}
      </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),300) }
  }

  function hesaplaKalem(idx:number, field:string, val:any) {
    const yeni = [...kalemleri]
    yeni[idx] = {...yeni[idx],[field]:val}
    yeni[idx].toplam = yeni[idx].miktar * yeni[idx].birim_fiyat * (1 + yeni[idx].kdv_orani/100)
    setKalemleri(yeni)
  }

  const araToplam = kalemleri.reduce((s,k)=>s+(k.miktar*k.birim_fiyat),0)
  const kdvTutari = kalemleri.reduce((s,k)=>s+(k.miktar*k.birim_fiyat*k.kdv_orani/100),0)
  const toplamDoviz = araToplam + kdvTutari
  const kurDeger = +form.kur || 1
  const toplam = toplamDoviz * kurDeger

  async function save(e:React.FormEvent) {
    e.preventDefault()
    const { data } = await muh.from('faturalar').insert({
      ...form, cari_id:form.cari_id||null, vade:form.vade||null, kur:kurDeger,
      ara_toplam:araToplam*kurDeger, kdv_tutari:kdvTutari*kurDeger, toplam,
      doviz_tutari: form.para_birimi!=='TRY' ? toplamDoviz : null,
      durum:'taslak'
    })
    const faturaId = (data as any)?.[0]?.id
    if (faturaId) {
      await Promise.all(kalemleri.map(k=>muh.from('fatura_kalemleri').insert({...k, fatura_id:faturaId})))
    }
    setModal(false)
    setKalemleri([{urun_adi:'',miktar:1,birim:'adet',birim_fiyat:0,kdv_orani:20,toplam:0}])
    showToast('Fatura oluşturuldu'); load()
  }

  async function durumGuncelle(id:string, durum:string) {
    await muh.from('faturalar').update({durum,updated_at:new Date().toISOString()}).eq('id',id)
    showToast('Durum güncellendi'); load()
    if (detay?.id===id) setDetay((d:any)=>({...d,durum}))
  }

  // Döviz faturasını güncel kurla tahsil et — gerçek kasa girişi, cari kapama ve kur farkını ayrı ayrı kaydeder
  async function dovizTahsilEt(e:React.FormEvent) {
    e.preventDefault()
    if (!detay || !dovizForm.kur || !dovizForm.kasa_hesap_id) return
    const D = +detay.doviz_tutari || 0
    const K0 = +detay.kur || 1
    const K1 = +dovizForm.kur
    const gercekTL = D*K1
    const orijinalTL = D*K0
    const fark = gercekTL - orijinalTL // pozitif: kur farkı geliri, negatif: kur farkı gideri
    const tarih = new Date().toISOString().split('T')[0]

    await Promise.all([
      // 1) Kasaya gerçek TL girişi (cari'ye dokunmaz)
      muh.from('islemler').insert({
        tip:'gelir', tutar:gercekTL, kategori:'Döviz Tahsilatı', tarih,
        kasa_hesap_id: dovizForm.kasa_hesap_id,
        aciklama:`${detay.no} — ${D} ${detay.para_birimi} × ${K1}`,
      }),
      // 2) Cari bakiyeyi orijinal (faturalanmış) TL tutarla tam kapat (kasaya dokunmaz)
      muh.from('islemler').insert({
        tip:'gelir', tutar:orijinalTL, kategori:'Fatura Kapama', tarih,
        cari_id: detay.cari_id,
        aciklama:`${detay.no} kapatma (fatura kuru: ${K0})`,
      }),
      // 3) Kur farkını ayrı P&L kaydı olarak işle (ne kasa ne cari etkilenir)
      ...(Math.abs(fark) > 0.01 ? [muh.from('islemler').insert({
        tip: fark>0?'gelir':'gider', tutar: Math.abs(fark),
        kategori: fark>0?'Kur Farkı Geliri':'Kur Farkı Gideri', tarih,
        aciklama:`${detay.no} — fatura kuru ${K0}, tahsilat kuru ${K1}`,
      })] : []),
    ])
    await muh.from('faturalar').update({durum:'odendi',updated_at:new Date().toISOString()}).eq('id',detay.id)
    setDovizModal(false); setDovizForm({kur:'',kasa_hesap_id:''})
    showToast('Tahsilat ve kur farkı işlendi'); load()
  }

  const filtered = faturalar.filter(f => {
    if (filter!=='hepsi' && f.durum!==filter) return false
    if (search && !f.no?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const toplamBekleyen = faturalar.filter(f=>f.durum==='onaylandi').reduce((s,f)=>s+(+f.toplam),0)
  const toplamOdenen   = faturalar.filter(f=>f.durum==='odendi').reduce((s,f)=>s+(+f.toplam),0)

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Faturalar"/>
      <div style={{padding:24}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
          {[
            {label:'Toplam Fatura', value:faturalar.length,       color:'var(--adm-ac)'},
            {label:'Bekleyen',      value:muh.fmt(toplamBekleyen), color:'var(--adm-amber)'},
            {label:'Tahsil Edilen', value:muh.fmt(toplamOdenen),  color:'var(--adm-green)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`,padding:'14px 16px'}}>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:s.label==='Toplam Fatura'?28:18,color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:160,maxWidth:260}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Fatura no ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          {['hepsi','taslak','onaylandi','odendi','iptal'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={filter===f?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'5px 12px'}}>
              {DURUM_CONF[f]?.l||'Tümü'}
            </button>
          ))}
          <div style={{flex:1}}/>
          <button className="adm-btn-ghost" style={{fontSize:12}} onClick={()=>muh.exportCsv('faturalar.csv',filtered)}><Download size={13}/>CSV</button>
          <button className="adm-btn" onClick={()=>setModal(true)}><Plus size={14}/>Yeni Fatura</button>
        </div>

        <div className={`adm-detail-grid ${detay?"has-detail":""}`}>
          <div className="adm-card">
            <div className="adm-card-h">Faturalar ({filtered.length})</div>
            {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
            : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Fatura bulunamadı</p>
            : filtered.map(f=>{
              const d=DURUM_CONF[f.durum]||DURUM_CONF.taslak
              const cari = cariList.find((c:any)=>c.id===f.cari_id)
              return (
                <div key={f.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===f.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(f)}>
                  <div style={{width:36,height:36,borderRadius:9,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <FileText size={15} style={{color:'var(--adm-ac)'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:700,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{f.no}</p>
                    <p style={{fontSize:11.5,color:'var(--adm-tx3)'}}>{cari?.ad||'—'} · {muh.date(f.tarih)}</p>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                    <span style={{fontSize:14,fontWeight:700,color:'var(--adm-tx)',fontFamily:'JetBrains Mono,monospace'}}>{muh.fmt(f.toplam)}</span>
                    <span className="adm-badge" style={{background:d.bg,color:d.c}}>{d.l}</span>
                  </div>
                </div>
              )
            })}
          {faturalar.length===pageSize && (
            <div style={{padding:14,textAlign:'center'}}>
              <button className="adm-btn-ghost" style={{fontSize:12}} onClick={()=>setPageSize(p=>p+200)}>Daha Fazla Yükle</button>
            </div>
          )}
          </div>

          {detay && (
            <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0}}>
              <div className="adm-card-h">
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:13}}>{detay.no}</span>
                <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
              </div>
              <div style={{padding:20}}>
                <div style={{marginBottom:16}}>
                  {[
                    {l:'Tip',     v:detay.tip==='satis'?'Satış':'Alış'},
                    {l:'Tarih',   v:muh.date(detay.tarih)},
                    {l:'Vade',    v:muh.date(detay.vade)},
                    {l:'Ara Toplam', v:muh.fmt(detay.ara_toplam)},
                    {l:'KDV',     v:muh.fmt(detay.kdv_tutari)},
                    {l:'Toplam',  v:muh.fmt(detay.toplam)},
                  ].map(r=>(
                    <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                      <span style={{fontSize:12.5,color:'var(--adm-tx3)'}}>{r.l}</span>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--adm-tx)'}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:12,color:'var(--adm-tx3)',marginBottom:8}}>Durum Değiştir:</p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                  {Object.entries(DURUM_CONF).map(([k,v])=>(
                    <button key={k} onClick={()=>durumGuncelle(detay.id,k)}
                      className={detay.durum===k?'adm-btn':'adm-btn-ghost'}
                      style={{fontSize:11,padding:'4px 10px',background:detay.durum===k?v.c:undefined}}>
                      {v.l}
                    </button>
                  ))}
                </div>
                <button className="adm-btn-ghost" style={{width:'100%'}} onClick={()=>yazdir(detay)}><Download size={13}/>Yazdır / PDF</button>
                {detay.para_birimi && detay.para_birimi!=='TRY' && detay.durum!=='odendi' && (
                  <button className="adm-btn-ghost" style={{width:'100%',marginTop:8}} onClick={()=>{setDovizForm({kur:String(detay.kur||1),kasa_hesap_id:''});setDovizModal(true)}}>
                    <RefreshCw size={13}/>Güncel Kurla Tahsil Et
                  </button>
                )}
                {detay.notlar && <p style={{fontSize:12.5,color:'var(--adm-tx3)',marginTop:12,lineHeight:1.6}}>{detay.notlar}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal" style={{maxWidth:640}}>
            <div className="adm-modal-h">
              Yeni Fatura
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label className="adm-label">Fatura Tipi</label>
                  <select className="adm-inp" value={form.tip} onChange={e=>setForm(f=>({...f,tip:e.target.value}))}>
                    <option value="satis">Satış Faturası</option>
                    <option value="alis">Alış Faturası</option>
                    <option value="iade">İade Faturası</option>
                  </select>
                </div>
                <div><label className="adm-label">Fatura No *</label><input className="adm-inp" required value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))}/></div>
                <div>
                  <label className="adm-label">Cari Hesap</label>
                  <select className="adm-inp" value={form.cari_id} onChange={e=>setForm(f=>({...f,cari_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {cariList.map((c:any)=><option key={c.id} value={c.id}>{c.ad}</option>)}
                  </select>
                </div>
                <div><label className="adm-label">Tarih</label><input type="date" className="adm-inp" value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))}/></div>
                <div><label className="adm-label">Vade Tarihi</label><input type="date" className="adm-inp" value={form.vade} onChange={e=>setForm(f=>({...f,vade:e.target.value}))}/></div>
                <div><label className="adm-label">KDV %</label><input type="number" className="adm-inp" value={form.kdv_orani} onChange={e=>setForm(f=>({...f,kdv_orani:+e.target.value}))}/></div>
                <div><label className="adm-label">Para Birimi</label>
                  <select className="adm-inp" value={form.para_birimi} onChange={e=>setForm(f=>({...f,para_birimi:e.target.value, kur: e.target.value==='TRY'?'1':f.kur}))}>
                    {['TRY','USD','EUR','GBP'].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {form.para_birimi!=='TRY' && (
                  <div><label className="adm-label">Kur (1 {form.para_birimi} = ? ₺)</label><input type="number" step="0.0001" className="adm-inp" value={form.kur} onChange={e=>setForm(f=>({...f,kur:e.target.value}))}/></div>
                )}

                {/* Kalemler */}
                <div style={{gridColumn:'1/-1'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <label className="adm-label" style={{margin:0}}>Kalemler</label>
                    <button type="button" className="adm-btn-ghost" style={{fontSize:11,padding:'3px 10px'}}
                      onClick={()=>setKalemleri(k=>[...k,{urun_adi:'',miktar:1,birim:'adet',birim_fiyat:0,kdv_orani:form.kdv_orani,toplam:0}])}>
                      + Kalem Ekle
                    </button>
                  </div>
                  {kalemleri.map((k,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:6,marginBottom:8,alignItems:'center'}}>
                      <input className="adm-inp" placeholder="Ürün/hizmet adı" value={k.urun_adi} onChange={e=>hesaplaKalem(i,'urun_adi',e.target.value)} style={{fontSize:12}}/>
                      <input type="number" className="adm-inp" placeholder="Adet" value={k.miktar} onChange={e=>hesaplaKalem(i,'miktar',+e.target.value)} style={{fontSize:12}}/>
                      <input type="number" className="adm-inp" placeholder="Birim fiyat" value={k.birim_fiyat} onChange={e=>hesaplaKalem(i,'birim_fiyat',+e.target.value)} style={{fontSize:12}}/>
                      <span style={{fontSize:12,color:'var(--adm-ac)',fontFamily:'JetBrains Mono,monospace',textAlign:'right'}}>{muh.fmt(k.miktar*k.birim_fiyat)}</span>
                      <button type="button" onClick={()=>setKalemleri(k=>k.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-red)'}} disabled={kalemleri.length===1}><X size={14}/></button>
                    </div>
                  ))}
                  <div style={{textAlign:'right',padding:'8px 0',borderTop:'1px solid var(--adm-bdr)',marginTop:4}}>
                    <span style={{fontSize:12,color:'var(--adm-tx3)'}}>Ara Toplam: </span>
                    <span style={{fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-tx)'}}>{araToplam.toFixed(2)} {form.para_birimi}</span>
                    <span style={{fontSize:12,color:'var(--adm-tx3)',marginLeft:12}}>KDV: </span>
                    <span style={{fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-amber)'}}>{kdvTutari.toFixed(2)} {form.para_birimi}</span>
                    <span style={{fontSize:14,fontWeight:700,marginLeft:12,color:'var(--adm-green)',fontFamily:'JetBrains Mono,monospace'}}>
                      = {form.para_birimi!=='TRY' ? `${toplamDoviz.toFixed(2)} ${form.para_birimi} → ` : ''}{muh.fmt(toplam)}
                    </span>
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))}/></div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button>
                <button type="submit" className="adm-btn">Fatura Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {dovizModal && detay && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setDovizModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">{detay.no} — Güncel Kurla Tahsil Et<button onClick={()=>setDovizModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <form onSubmit={dovizTahsilEt}>
              <div className="adm-modal-b">
                <p style={{fontSize:12,color:'var(--adm-tx3)',marginBottom:14}}>
                  Fatura {detay.doviz_tutari} {detay.para_birimi} olarak kesildi (kur: {detay.kur}). Tahsilat gününün kurunu gir, sistem gerçek TL girişini, cari kapamayı ve kur farkını otomatik ayrıştırsın.
                </p>
                <div style={{marginBottom:14}}>
                  <label className="adm-label">Tahsilat Günü Kuru (1 {detay.para_birimi} = ? ₺)</label>
                  <input type="number" step="0.0001" required className="adm-inp" value={dovizForm.kur} onChange={e=>setDovizForm(f=>({...f,kur:e.target.value}))}/>
                </div>
                <div style={{marginBottom:10}}>
                  <label className="adm-label">Kasa/Banka Hesabı *</label>
                  <select className="adm-inp" required value={dovizForm.kasa_hesap_id} onChange={e=>setDovizForm(f=>({...f,kasa_hesap_id:e.target.value}))}>
                    <option value="">Seçin</option>
                    {kasaListesi.map((k:any)=><option key={k.id} value={k.id}>{k.ad}</option>)}
                  </select>
                </div>
                {dovizForm.kur && (
                  <p style={{fontSize:12,color:'var(--adm-tx3)'}}>
                    Kasaya girecek: <b>{muh.fmt((+detay.doviz_tutari||0)*(+dovizForm.kur))}</b> ·
                    Kur farkı: <b style={{color:((+dovizForm.kur)-(+detay.kur))>=0?'var(--adm-green)':'var(--adm-red)'}}>
                      {muh.fmt(Math.abs((+detay.doviz_tutari||0)*((+dovizForm.kur)-(+detay.kur))))} {((+dovizForm.kur)-(+detay.kur))>=0?'(gelir)':'(gider)'}
                    </b>
                  </p>
                )}
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setDovizModal(false)}>İptal</button>
                <button type="submit" className="adm-btn">Tahsil Et</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
