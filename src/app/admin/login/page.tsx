'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr('')
    const { error } = await createClient().auth.signInWithPassword({ email, password: pass })
    if (error) { setErr('E-posta veya şifre hatalı.'); setLoading(false) }
    else window.location.href = '/admin/dashboard'
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--adm-bg)', padding:16 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--adm-ac)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 8px 24px rgba(229,95,40,.35)' }}>
            <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'var(--adm-tx)', letterSpacing:'-.3px', margin:0 }}>Alya Plastik</h1>
          <p style={{ fontSize:12.5, color:'var(--adm-tx3)', marginTop:4 }}>Yönetim Paneli</p>
        </div>

        <form onSubmit={login} className="adm-card" style={{ padding:28 }}>
          <div style={{ marginBottom:16 }}>
            <label className="adm-label">E-posta</label>
            <input type="email" className="adm-inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@alyaplastik.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="adm-label">Şifre</label>
            <input type="password" className="adm-inp" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          {err && <p style={{ color:'var(--adm-red)', fontSize:12.5, marginBottom:14, textAlign:'center' }}>{err}</p>}
          <button type="submit" className="adm-btn" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'10px 0' }}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:11.5, color:'var(--adm-tx3)', marginTop:20 }}>
          Alya Plastik San. Tic. Ltd. Şti. © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
