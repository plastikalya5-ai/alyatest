'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { Upload, Check, X, Search, Landmark } from 'lucide-react'

export default function BankaEkstresiPage() {
  const [kasalar, setKasalar] = useState<any[]>([])
  const [kayitlar, setKayitlar] = useState<any[]>([])
  const [islemler, setIslemler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [kasaSecim, setKasaSecim] = useState('')
  const [filter, setFilter] = useState('eslesmedi')
  const [toast, setToast] = useState('')
  const [eslesmeModal, setEslesmeModal] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  const load = useCallback(async () => {
    const [{data:k},{data:e},{data:i}] = await Promise.all([
      erp.from('kasa_banka_hesaplari').select('*').eq('tip','banka').order('ad',{ascending:true}),
      erp.from('banka_ekstre_kayitlari').select('*').order('tarih',{ascending:false}),
      muh.from('islemler').select('*').order('tarih',{ascending:false}),
    ])
    setKasalar(k||[]); setKayitlar(e||[]); setIslemler(i||[]); setLoading(false)
    if (!kasaSecim && k?.length) setKasaSecim(k[0].id)
  },[kasaSecim])
  useEffect(()=>{ load() },[load])

  function csvParse(text:string) {
    // Beklenen format: tarih,aciklama,tutar  (tutar: pozitif=giriş, negatif=çıkış)
    const lines = text.trim().split('\n').filter(Boolean)
    const start = /tarih/i.test(lines[0]) ? 1 : 0
    return lines.slice(start).map(line => {
      const [tarih, aciklama, tutarStr] = line.split(',').map(s=>s?.trim().replace(/^"|"$/g,''))
      const tutar = parseFloat((tutarStr||'0').replace(/\./g,'').replace(',','.')) || parseFloat(tutarStr) || 0
      return { tarih: normalizeDate(tarih), aciklama, tutar: Math.abs(tutar), yon: tutar>=0?'giris':'cikis' }
    }).filter(r=>r.tarih && r.tutar)
  }

  function normalizeDate(d:string) {
    if (!d) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const m = d.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
    return ''
  }

  async function dosyaYukle(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !kasaSecim) return
    const text = await file.text()
    const satirlar = csvParse(text)
    if (satirlar.length===0) { showToast('Dosyada geçerli satır bulunamadı (tarih,açıklama,tutar bekleniyor)'); return }
    await Promise.all(satirlar.map(s=>erp.from('banka_ekstre_kayitlari').insert({...s, kasa_hesap_id:kasaSecim})))
    showToast(`${satirlar.length} satır yüklendi`); load()
    if (fileRef.current) fileRef.current.value = ''
  }

  function adaylariBul(kayit:any) {
    return islemler.filter(i=>{
      if (i.kasa_hesap_id !== kayit.kasa_hesap_id) return false
      if (Math.abs(i.tutar - kayit.tutar) > 0.01) return false
      if ((kayit.yon==='giris') !== (i.tip==='gelir')) return false
      const fark = Math.abs(new Date(i.tarih).getTime() - new Date(kayit.tarih).getTime()) / 86400000
      return fark <= 5
    })
  }

  async function eslestir(kayitId:string, islemId:string) {
    await erp.from('banka_ekstre_kayitlari').update({eslesme_islem_id:islemId, durum:'eslesti'}).eq('id',kayitId)
    setEslesmeModal(null); showToast('Eşleştirildi'); load()
  }
  async function yoksay(kayitId:string) {
    await erp.from('banka_ekstre_kayitlari').update({durum:'yoksayildi'}).eq('id',kayitId)
    showToast('Yoksayıldı'); load()
  }

  const gorunenKayitlar = kayitlar.filter(k => k.kasa_hesap_id===kasaSecim && (filter==='hepsi' || k.durum===filter))
  const eslesmemisSayi = kayitlar.filter(k=>k.kasa_hesap_id===kasaSecim && k.durum==='eslesmedi').length

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Banka Ekstresi Eşleştirme"/>
      <div style={{padding:24}}>

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          <select className="adm-inp" style={{width:'auto'}} value={kasaSecim} onChange={e=>setKasaSecim(e.target.value)}>
            {kasalar.length===0 && <option value="">Önce bir banka hesabı ekleyin</option>}
            {kasalar.map((k:any)=><option key={k.id} value={k.id}>{k.ad}</option>)}
          </select>
          {['eslesmedi','eslesti','yoksayildi','hepsi'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={filter===f?'adm-btn':'adm-btn-ghost'} style={{fontSize:11,padding:'5px 12px'}}>
              {f==='eslesmedi'?'Eşleşmedi':f==='eslesti'?'Eşleşti':f==='yoksayildi'?'Yoksayıldı':'Tümü'}
            </button>
          ))}
          <div style={{flex:1}}/>
          <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}} onChange={dosyaYukle}/>
          <button className="adm-btn" onClick={()=>fileRef.current?.click()} disabled={!kasaSecim}><Upload size={14}/>Ekstre Yükle (CSV)</button>
        </div>

        {eslesmemisSayi>0 && (
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--adm-amber2)',border:'1px solid var(--adm-amber)',borderRadius:10,marginBottom:16,fontSize:12.5}}>
            <Search size={15} style={{color:'var(--adm-amber)',flexShrink:0}}/>
            <span><b>{eslesmemisSayi}</b> ekstre satırı henüz sistemdeki bir işlemle eşleştirilmedi.</span>
          </div>
        )}

        <p style={{fontSize:11,color:'var(--adm-tx3)',marginBottom:12}}>CSV formatı: her satır <code>tarih,açıklama,tutar</code> (tutar pozitifse giriş, negatifse çıkış). İlk satır başlık olabilir.</p>

        <div className="adm-card">
          <div className="adm-card-h"><span style={{display:'flex',alignItems:'center',gap:6}}><Landmark size={14}/>Ekstre Satırları ({gorunenKayitlar.length})</span></div>
          {loading ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)'}}>Yükleniyor...</p>
          : gorunenKayitlar.length===0 ? <p style={{padding:40,textAlign:'center',color:'var(--adm-tx3)',fontSize:13}}>Kayıt yok</p>
          : gorunenKayitlar.map(k=>{
            const adaylar = k.durum==='eslesmedi' ? adaylariBul(k) : []
            const eslesenIslem = k.eslesme_islem_id ? islemler.find((i:any)=>i.id===k.eslesme_islem_id) : null
            return (
              <div key={k.id} className="adm-row">
                <div style={{width:32,height:32,borderRadius:8,background:k.yon==='giris'?'var(--adm-green2)':'var(--adm-red2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:14,fontWeight:700,color:k.yon==='giris'?'var(--adm-green)':'var(--adm-red)'}}>{k.yon==='giris'?'+':'−'}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{k.aciklama||'—'}</p>
                  <p style={{fontSize:11,color:'var(--adm-tx3)'}}>
                    {muh.date(k.tarih)}
                    {k.durum==='eslesti' && eslesenIslem && ` · Eşleşti: ${eslesenIslem.aciklama||eslesenIslem.kategori}`}
                    {k.durum==='eslesmedi' && adaylar.length>0 && ` · ${adaylar.length} olası eşleşme bulundu`}
                  </p>
                </div>
                <span style={{fontSize:13,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:k.yon==='giris'?'var(--adm-green)':'var(--adm-red)'}}>{muh.fmt(k.tutar)}</span>
                {k.durum==='eslesmedi' && (
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button className="adm-btn-ghost" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>setEslesmeModal(k)} disabled={adaylar.length===0}>Eşleştir</button>
                    <button className="adm-btn-ghost" style={{padding:'4px 8px'}} onClick={()=>yoksay(k.id)}><X size={12}/></button>
                  </div>
                )}
                {k.durum==='eslesti' && <Check size={16} style={{color:'var(--adm-green)',flexShrink:0}}/>}
              </div>
            )
          })}
        </div>
      </div>

      {eslesmeModal && (
        <div className="adm-modal-bg" onClick={e=>{if(e.target===e.currentTarget)setEslesmeModal(null)}}>
          <div className="adm-modal">
            <div className="adm-modal-h">Eşleştirme Adayları<button onClick={()=>setEslesmeModal(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--adm-tx3)'}}><X size={18}/></button></div>
            <div className="adm-modal-b">
              <p style={{fontSize:12,color:'var(--adm-tx3)',marginBottom:12}}>{eslesmeModal.aciklama} — {muh.fmt(eslesmeModal.tutar)} ({muh.date(eslesmeModal.tarih)})</p>
              {adaylariBul(eslesmeModal).map((a:any)=>(
                <div key={a.id} className="adm-row" style={{cursor:'pointer'}} onClick={()=>eslestir(eslesmeModal.id,a.id)}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12.5,fontWeight:600,color:'var(--adm-tx)'}}>{a.aciklama||a.kategori}</p>
                    <p style={{fontSize:11,color:'var(--adm-tx3)'}}>{muh.date(a.tarih)}</p>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,fontFamily:'JetBrains Mono,monospace'}}>{muh.fmt(a.tutar)}</span>
                </div>
              ))}
            </div>
            <div className="adm-modal-f"><button className="adm-btn-ghost" onClick={()=>setEslesmeModal(null)}>Kapat</button></div>
          </div>
        </div>
      )}
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
