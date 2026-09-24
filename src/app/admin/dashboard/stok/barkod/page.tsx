'use client'
import { useState, useRef, useEffect } from 'react'
import AdminTopBar from '@/components/admin/TopBar'
import { erp } from '@/lib/erp-client'
import { muh } from '@/lib/muhasebe-client'
import { ScanLine, Boxes, Package, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default function BarkodPage() {
  const [barkod, setBarkod] = useState('')
  const [bulunan, setBulunan] = useState<any>(null)
  const [tip, setTip] = useState<'variant'|'hammadde'|null>(null)
  const [miktar, setMiktar] = useState('1')
  const [yon, setYon] = useState<'giris'|'cikis'>('giris')
  const [gecmis, setGecmis] = useState<any[]>([])
  const [toast, setToast] = useState('')
  const [hata, setHata] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{ inputRef.current?.focus() },[])

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000) }

  async function ara(e:React.FormEvent) {
    e.preventDefault()
    setHata(''); setBulunan(null); setTip(null)
    if (!barkod.trim()) return
    const [{data:v},{data:h}] = await Promise.all([
      muh.from('product_variants').select('*').eq('barkod',barkod.trim()),
      erp.from('hammaddeler').select('*').eq('barkod',barkod.trim()),
    ])
    if (v && v.length) { setBulunan(v[0]); setTip('variant'); setYon('cikis') }
    else if (h && h.length) { setBulunan(h[0]); setTip('hammadde'); setYon('giris') }
    else setHata('Bu barkoda kayıtlı ürün/hammadde bulunamadı')
  }

  async function islemUygula() {
    if (!bulunan || !tip || !miktar) return
    const m = +miktar
    if (tip==='variant') {
      await erp.from('stok_hareketleri').insert({
        tip:'manuel_duzeltme', yon, variant_id: bulunan.id, miktar: m,
        kaynak_tablo:'barkod', aciklama:`Barkod ile hızlı işlem (${barkod})`,
      })
    } else {
      await erp.from('stok_hareketleri').insert({
        tip:'manuel_duzeltme', yon, hammadde_id: bulunan.id, miktar: m,
        kaynak_tablo:'barkod', aciklama:`Barkod ile hızlı işlem (${barkod})`,
      })
    }
    setGecmis(g=>[{ad:bulunan.name||bulunan.ad, tip, yon, miktar:m, zaman:new Date()}, ...g].slice(0,15))
    showToast(`${yon==='giris'?'Giriş':'Çıkış'} kaydedildi`)
    setBarkod(''); setBulunan(null); setTip(null); setMiktar('1')
    inputRef.current?.focus()
  }

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <AdminTopBar title="Barkod ile Hızlı İşlem"/>
      <div style={{padding:24,maxWidth:600}}>

        <form onSubmit={ara} className="adm-card" style={{padding:20,marginBottom:20}}>
          <label className="adm-label">Barkod Okut / Gir</label>
          <div style={{display:'flex',gap:8}}>
            <div style={{position:'relative',flex:1}}>
              <ScanLine size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--adm-tx3)'}}/>
              <input ref={inputRef} className="adm-inp" style={{paddingLeft:36,fontSize:15}} value={barkod} onChange={e=>setBarkod(e.target.value)} placeholder="8690000000000" autoFocus/>
            </div>
            <button type="submit" className="adm-btn">Ara</button>
          </div>
          {hata && <p style={{color:'var(--adm-red)',fontSize:12.5,marginTop:10}}>{hata}</p>}
        </form>

        {bulunan && (
          <div className="adm-card" style={{padding:20,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:10,background:'var(--adm-ac2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {tip==='variant' ? <Package size={20} style={{color:'var(--adm-ac)'}}/> : <Boxes size={20} style={{color:'var(--adm-ac)'}}/>}
              </div>
              <div>
                <p style={{fontSize:15,fontWeight:700,color:'var(--adm-tx)'}}>{tip==='variant' ? bulunan.name : bulunan.ad}</p>
                <p style={{fontSize:12,color:'var(--adm-tx3)'}}>{tip==='variant' ? `Mevcut stok: ${bulunan.stock}` : `Mevcut stok: ${muh.fmtN(bulunan.mevcut_stok)} ${bulunan.birim}`}</p>
              </div>
            </div>

            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <button type="button" onClick={()=>setYon('giris')} className={yon==='giris'?'adm-btn':'adm-btn-ghost'} style={{flex:1,justifyContent:'center'}}><ArrowDownCircle size={14}/>Giriş</button>
              <button type="button" onClick={()=>setYon('cikis')} className={yon==='cikis'?'adm-btn':'adm-btn-ghost'} style={{flex:1,justifyContent:'center'}}><ArrowUpCircle size={14}/>Çıkış</button>
            </div>

            <label className="adm-label">Miktar</label>
            <input type="number" step="0.001" className="adm-inp" value={miktar} onChange={e=>setMiktar(e.target.value)} style={{marginBottom:14}}/>

            <button className="adm-btn" style={{width:'100%',justifyContent:'center'}} onClick={islemUygula}>Kaydet</button>
          </div>
        )}

        {gecmis.length>0 && (
          <div className="adm-card">
            <div className="adm-card-h">Son İşlemler (bu oturum)</div>
            {gecmis.map((g,i)=>(
              <div key={i} className="adm-row">
                <span style={{flex:1,fontSize:12.5,color:'var(--adm-tx)'}}>{g.ad}</span>
                <span style={{fontSize:12.5,fontWeight:700,color:g.yon==='giris'?'var(--adm-green)':'var(--adm-red)'}}>{g.yon==='giris'?'+':'-'}{g.miktar}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <div className="adm-toast">✓ {toast}</div>}
    </div>
  )
}
