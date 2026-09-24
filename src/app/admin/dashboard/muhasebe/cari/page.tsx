'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { muh } from '@/lib/muhasebe-client'
import { Plus, Pencil, Trash2, X, User, Building2, Search, Phone, Mail, Download, FileBarChart } from 'lucide-react'

export default function CariPage() {
  const [list, setList] = useState<any[]>([])
  const [islemler, setIslemler] = useState<any[]>([])
  const [faturalar, setFaturalar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [detay, setDetay] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('hepsi')
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ tip:'musteri', ad:'', vergi_no:'', telefon:'', email:'', adres:'', notlar:'' })

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:c},{data:i},{data:f}] = await Promise.all([
      muh.from('cari_hesaplar').select('*').order('ad',{ascending:true}),
      muh.from('islemler').select('*'),
      muh.from('faturalar').select('*'),
    ])
    setList(c||[]); setIslemler(i||[]); setFaturalar(f||[]); setLoading(false)
    setDetay((d:any)=>d ? (c||[]).find((x:any)=>x.id===d.id) || null : null)
  },[])

  useEffect(()=>{ load() },[load])

  function openNew() { setEditing(null); setForm({tip:'musteri',ad:'',vergi_no:'',telefon:'',email:'',adres:'',notlar:''}); setModal(true) }
  function openEdit(c:any) { setEditing(c); setForm({tip:c.tip,ad:c.ad,vergi_no:c.vergi_no||'',telefon:c.telefon||'',email:c.email||'',adres:c.adres||'',notlar:c.notlar||''}); setModal(true) }

  async function save(e:React.FormEvent) {
    e.preventDefault()
    if (editing) await muh.from('cari_hesaplar').update({...form,updated_at:new Date().toISOString()}).eq('id',editing.id)
    else await muh.from('cari_hesaplar').insert(form)
    setModal(false); showToast(editing?'Güncellendi':'Eklendi'); load()
  }

  async function del(id:string) {
    if (!confirm('Silinsin mi?')) return
    await muh.from('cari_hesaplar').delete().eq('id',id)
    showToast('Silindi'); load(); setDetay(null)
  }

  const filtered = list.filter(c => {
    if (filter!=='hepsi' && c.tip!==filter) return false
    if (search && !c.ad?.toLowerCase().includes(search.toLowerCase()) && !c.email?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // ---- Ekstre: cariye ait fatura + işlem hareketlerini kronolojik birleştir, bakiye yürüt ----
  function ekstreHesapla(cariId:string) {
    const hareketler: {tarih:string; aciklama:string; borc:number; alacak:number}[] = []
    faturalar.filter(f=>f.cari_id===cariId && ['onaylandi','odendi'].includes(f.durum)).forEach(f=>{
      const borcMu = f.tip==='satis' // satış: cari bize borçlanır (borç); alış/iade: bizim borcumuz (alacak)
      hareketler.push({ tarih:f.tarih, aciklama:`Fatura ${f.no}`, borc: borcMu?f.toplam:0, alacak: borcMu?0:f.toplam })
    })
    islemler.filter(i=>i.cari_id===cariId).forEach(i=>{
      // gelir = tahsilat (borç azalır/alacak), gider = ödeme (bizim borcumuz azalır/borç)
      hareketler.push({ tarih:i.tarih, aciklama:i.aciklama||i.kategori||'İşlem', borc: i.tip==='gider'?i.tutar:0, alacak: i.tip==='gelir'?i.tutar:0 })
    })
    hareketler.sort((a,b)=>a.tarih.localeCompare(b.tarih))
    let bakiye = 0
    return hareketler.map(h=>{ bakiye += h.borc - h.alacak; return {...h, bakiye} })
  }

  function cariBakiye(cariId:string) {
    const ek = ekstreHesapla(cariId)
    return ek.length ? ek[ek.length-1].bakiye : 0
  }

  function ekstreYazdir(cari:any) {
    const ek = ekstreHesapla(cari.id)
    const satirlar = ek.map(h=>`
      <tr>
        <td>${muh.date(h.tarih)}</td><td>${h.aciklama}</td>
        <td style="text-align:right">${h.borc?muh.fmt(h.borc):''}</td>
        <td style="text-align:right">${h.alacak?muh.fmt(h.alacak):''}</td>
        <td style="text-align:right;font-weight:600">${muh.fmt(h.bakiye)}</td>
      </tr>`).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${cari.ad} - Ekstre</title>
      <style>
        body{font-family:Arial,sans-serif;color:#0b0e0b;padding:40px;max-width:800px;margin:0 auto}
        h1{font-size:20px;margin:0 0 4px} .muted{color:#6b7366;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        th,td{padding:8px 6px;font-size:13px;border-bottom:1px solid #ddd;text-align:left}
        th{color:#6b7366;font-size:11px;text-transform:uppercase}
        .header{display:flex;justify-content:space-between;border-bottom:2px solid #e55f28;padding-bottom:16px;margin-bottom:16px}
        .toplam{margin-top:16px;text-align:right;font-size:15px;font-weight:700}
        @media print{body{padding:0}}
      </style></head><body>
        <div class="header">
          <div><h1>ALYA PLASTİK</h1><p class="muted">Cari Hesap Ekstresi</p></div>
          <div style="text-align:right"><h1>${cari.ad}</h1><p class="muted">${new Date().toLocaleDateString('tr-TR')} itibarıyla</p></div>
        </div>
        <table>
          <thead><tr><th>Tarih</th><th>Açıklama</th><th style="text-align:right">Borç</th><th style="text-align:right">Alacak</th><th style="text-align:right">Bakiye</th></tr></thead>
          <tbody>${satirlar}</tbody>
        </table>
        <p class="toplam">Güncel Bakiye: ${muh.fmt(ek.length?ek[ek.length-1].bakiye:0)}</p>
      </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),300) }
  }

  const TIP_CONF: Record<string,{l:string;Icon:any;c:string}> = {
    musteri:    {l:'Müşteri',    Icon:User,      c:'var(--adm-blue)'},
    tedarikci:  {l:'Tedarikçi', Icon:Building2, c:'var(--adm-amber)'},
    diger:      {l:'Diğer',     Icon:User,      c:'var(--adm-tx3)'},
  }

  const detayEkstre = detay ? ekstreHesapla(detay.id) : []

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Cari Hesaplar"/>
      <div style={{padding:24}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Müşteri',    value:list.filter(c=>c.tip==='musteri').length,   color:'var(--adm-blue)'},
            {label:'Tedarikçi',  value:list.filter(c=>c.tip==='tedarikci').length, color:'var(--adm-amber)'},
            {label:'Toplam',     value:list.length,                                color:'var(--adm-ac)'},
          ].map(s=>(
            <div key={s.label} className="adm-kpi" style={{borderLeft:`2.5px solid ${s.color}`,padding:'14px 16px'}}>
              <p className="adm-kpi-label">{s.label}</p>
              <p className="adm-kpi-value" style={{fontSize:24,color:s.color}}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:180,maxWidth:280}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
            <input className="adm-inp" placeholder="Ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/>
          </div>
          {[['hepsi','Tümü'],['musteri','Müşteri'],['tedarikci','Tedarikçi']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} className={filter===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
          ))}
          <div style={{flex:1}}/>
          <button className="adm-btn-ghost" style={{fontSize:12}} onClick={()=>muh.exportCsv('cari-hesaplar.csv',filtered)}><Download size={13}/>CSV</button>
          <button className="adm-btn" onClick={openNew}><Plus size={14}/>Cari Ekle</button>
        </div>

        <div className={`adm-detail-grid ${detay?'has-detail':''}`}>
        <div className="adm-card">
          <div className="adm-card-h">Cari Listesi ({filtered.length})</div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : filtered.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Cari bulunamadı</p>
          : filtered.map(c => {
            const conf = TIP_CONF[c.tip]||TIP_CONF.diger
            const bakiye = cariBakiye(c.id)
            return (
              <div key={c.id} className="adm-row" style={{cursor:'pointer',background:detay?.id===c.id?'var(--adm-ac3)':''}} onClick={()=>setDetay(c)}>
                <div style={{width:38,height:38,borderRadius:10,background:conf.c+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <conf.Icon size={16} style={{color:conf.c}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                    <p style={{fontSize:13.5,fontWeight:700,color:'var(--adm-tx)'}}>{c.ad}</p>
                    <span className="adm-badge" style={{background:conf.c+'18',color:conf.c,fontSize:10}}>{conf.l}</span>
                  </div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    {c.telefon && <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11.5,color:'var(--adm-tx3)'}}><Phone size={10}/>{c.telefon}</span>}
                    {c.email && <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11.5,color:'var(--adm-tx3)'}}><Mail size={10}/>{c.email}</span>}
                    {c.vergi_no && <span style={{fontSize:11.5,color:'var(--adm-tx3)'}}>VKN: {c.vergi_no}</span>}
                  </div>
                </div>
                {bakiye!==0 && (
                  <span style={{fontSize:13,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:bakiye>0?'var(--adm-red)':'var(--adm-green)',flexShrink:0}}>
                    {bakiye>0?'Borçlu: ':'Alacaklı: '}{muh.fmt(Math.abs(bakiye))}
                  </span>
                )}
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button className="adm-btn-ghost" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();openEdit(c)}}><Pencil size={12}/></button>
                  <button className="adm-btn-danger" style={{padding:'5px 9px'}} onClick={(e)=>{e.stopPropagation();del(c.id)}}><Trash2 size={12}/></button>
                </div>
              </div>
            )
          })}
        </div>

        {detay && (
          <div className="adm-card" style={{height:'fit-content',position:'sticky',top:0,maxHeight:'80vh',overflow:'auto'}}>
            <div className="adm-card-h">
              <span>{detay.ad} — Ekstre</span>
              <button onClick={()=>setDetay(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={16}/></button>
            </div>
            <div style={{padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,padding:12,background:'var(--adm-s3)',borderRadius:8}}>
                <span style={{fontSize:12.5,color:'var(--adm-tx3)'}}>Güncel Bakiye</span>
                <span style={{fontSize:16,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:cariBakiye(detay.id)>0?'var(--adm-red)':'var(--adm-green)'}}>
                  {muh.fmt(Math.abs(cariBakiye(detay.id)))} {cariBakiye(detay.id)>0?'(Borçlu)':cariBakiye(detay.id)<0?'(Alacaklı)':''}
                </span>
              </div>
              {detayEkstre.length===0 ? <p style={{fontSize:12,color:'var(--adm-tx3)',textAlign:'center',padding:20}}>Hareket yok</p>
              : detayEkstre.map((h,i)=>(
                <div key={i} style={{padding:'8px 0',borderBottom:'1px solid var(--adm-bdr)'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--adm-tx)'}}>{h.aciklama}</span>
                    <span style={{fontSize:11,color:'var(--adm-tx3)'}}>{muh.date(h.tarih)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>
                    <span style={{fontSize:11.5,color:h.borc?'var(--adm-red)':'var(--adm-green)'}}>
                      {h.borc?`Borç: ${muh.fmt(h.borc)}`:`Alacak: ${muh.fmt(h.alacak)}`}
                    </span>
                    <span style={{fontSize:11.5,fontFamily:'JetBrains Mono,monospace',color:'var(--adm-tx3)'}}>Bakiye: {muh.fmt(h.bakiye)}</span>
                  </div>
                </div>
              ))}
              <button className="adm-btn-ghost" style={{width:'100%',marginTop:14}} onClick={()=>ekstreYazdir(detay)}><FileBarChart size={13}/>Ekstre Yazdır / PDF</button>
            </div>
          </div>
        )}
        </div>
      </div>

      {modal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">
              {editing?'Cari Düzenle':'Yeni Cari Hesap'}
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="adm-modal-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label className="adm-label">Tip</label>
                  <div style={{display:'flex',gap:6}}>
                    {[['musteri','Müşteri'],['tedarikci','Tedarikçi'],['diger','Diğer']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm(f=>({...f,tip:v}))}
                        className={form.tip===v?'adm-btn':'adm-btn-ghost'} style={{fontSize:12,padding:'5px 14px'}}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Ad / Unvan *</label><input className="adm-inp" required value={form.ad} onChange={e=>setForm(f=>({...f,ad:e.target.value}))} placeholder="Şirket veya kişi adı"/></div>
                <div><label className="adm-label">Vergi No / TC</label><input className="adm-inp" value={form.vergi_no} onChange={e=>setForm(f=>({...f,vergi_no:e.target.value}))} placeholder="1234567890"/></div>
                <div><label className="adm-label">Telefon</label><input className="adm-inp" value={form.telefon} onChange={e=>setForm(f=>({...f,telefon:e.target.value}))} placeholder="+90 5xx xxx xx xx"/></div>
                <div><label className="adm-label">E-posta</label><input type="email" className="adm-inp" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="firma@mail.com"/></div>
                <div><label className="adm-label">Adres</label><input className="adm-inp" value={form.adres} onChange={e=>setForm(f=>({...f,adres:e.target.value}))} placeholder="İstanbul..."/></div>
                <div style={{gridColumn:'1/-1'}}><label className="adm-label">Notlar</label><textarea className="adm-inp" rows={2} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))} placeholder="Ek bilgiler..."/></div>
              </div>
              <div className="adm-modal-f">
                <button type="button" className="adm-btn-ghost" onClick={()=>setModal(false)}>İptal</button>
                <button type="submit" className="adm-btn">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
