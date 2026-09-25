// Kritik güvenlik/erişim kontrollerini doğrulayan basit duman testi.
// Çalıştırma: node scripts/smoke-test.mjs https://alyatest-alyis.vercel.app
// Yeni bağımlılık gerektirmez, sadece fetch kullanır.

const base = process.argv[2] || 'https://alyatest-alyis.vercel.app'
let fail = 0

async function check(name, fn) {
  try {
    const ok = await fn()
    console.log(`${ok ? '✓' : '✗'} ${name}`)
    if (!ok) fail++
  } catch (e) {
    console.log(`✗ ${name} — ${e.message}`)
    fail++
  }
}

await check('Ana sayfa açılıyor', async () => {
  const r = await fetch(base + '/')
  return r.status === 200
})

await check('/admin/dashboard oturumsuz erişimde login\'e yönleniyor', async () => {
  const r = await fetch(base + '/admin/dashboard', { redirect: 'manual' })
  return r.status === 307 || r.status === 302 || (r.headers.get('location')||'').includes('/admin/login')
})

await check('/api/muhasebe oturumsuz istekte 401 dönüyor', async () => {
  const r = await fetch(base + '/api/muhasebe?table=cari_hesaplar')
  return r.status === 401
})

await check('/api/erp oturumsuz istekte 401 dönüyor', async () => {
  const r = await fetch(base + '/api/erp?table=hammaddeler')
  return r.status === 401
})

await check('/api/webhooks/sosyal tokensız istekte 401/503 dönüyor (veri sızmıyor)', async () => {
  const r = await fetch(base + '/api/webhooks/sosyal', { headers: { Authorization: 'Bearer yanlis' } })
  const t = await r.text()
  return (r.status === 401 || r.status === 503) && !t.includes('gonderiler')
})

await check('/api/admin/sosyal-gonder oturumsuz istekte 401 dönüyor', async () => {
  const r = await fetch(base + '/api/admin/sosyal-gonder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
  return r.status === 401
})

await check('/api/db kaldırılmış (404 dönüyor)', async () => {
  const r = await fetch(base + '/api/db?table=cari_hesaplar')
  return r.status === 404
})

console.log(fail === 0 ? '\nTüm kontroller geçti ✓' : `\n${fail} kontrol başarısız ✗`)
process.exit(fail === 0 ? 0 : 1)
