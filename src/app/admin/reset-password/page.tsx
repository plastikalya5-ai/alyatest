'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase, e-postadaki bağlantıdan gelen recovery token'ı otomatik olarak
    // oturuma işler (@supabase/ssr) — burada sadece oturumun kurulmasını bekliyoruz.
    const sb = createClient()
    sb.auth.getSession().then(() => setReady(true))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (pass.length < 8) { setErr('Şifre en az 8 karakter olmalı.'); return }
    if (pass !== pass2) { setErr('Şifreler eşleşmiyor.'); return }
    setLoading(true)
    const { error } = await createClient().auth.updateUser({ password: pass })
    setLoading(false)
    if (error) setErr('Bir hata oluştu, bağlantının süresi dolmuş olabilir. Tekrar deneyin.')
    else setOk(true)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--adm-bg)', padding:16 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:'var(--adm-tx)', letterSpacing:'-.3px', margin:0 }}>Yeni Şifre Belirle</h1>
        </div>

        {ok ? (
          <div className="adm-card" style={{ padding:28, textAlign:'center' }}>
            <p style={{fontSize:13,color:'var(--adm-tx)',marginBottom:16}}>Şifren güncellendi.</p>
            <a href="/admin/login" className="adm-btn" style={{justifyContent:'center'}}>Giriş Yap</a>
          </div>
        ) : !ready ? (
          <p style={{textAlign:'center',fontSize:12.5,color:'var(--adm-tx3)'}}>Yükleniyor...</p>
        ) : (
          <form onSubmit={submit} className="adm-card" style={{ padding:28 }}>
            <div style={{ marginBottom:16 }}>
              <label className="adm-label">Yeni Şifre</label>
              <input type="password" className="adm-inp" value={pass} onChange={e=>setPass(e.target.value)} placeholder="En az 8 karakter" required />
            </div>
            <div style={{ marginBottom:20 }}>
              <label className="adm-label">Yeni Şifre (Tekrar)</label>
              <input type="password" className="adm-inp" value={pass2} onChange={e=>setPass2(e.target.value)} required />
            </div>
            {err && <p style={{ color:'var(--adm-red)', fontSize:12.5, marginBottom:14, textAlign:'center' }}>{err}</p>}
            <button type="submit" className="adm-btn" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'10px 0' }}>
              {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
