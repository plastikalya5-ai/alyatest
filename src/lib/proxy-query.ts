// Sunucu tarafı: /api/erp ve /api/muhasebe proxy'lerinin ortak sorgu uygulayıcısı.
// Aynı filtre birden fazla kez verilebilir (eq=a:1&eq=b:2). Alan adları doğrulanır.
const FIELD = /^[a-zA-Z0-9_.]+$/

function split(s: string): [string, string] | null {
  const i = s.indexOf(':')
  if (i < 1) return null
  const f = s.slice(0, i)
  return FIELD.test(f) ? [f, s.slice(i + 1)] : null
}

export function applyQuery(q: any, sp: URLSearchParams) {
  for (const s of sp.getAll('eq'))  { const p = split(s); if (p) q = q.eq(p[0], p[1]) }
  for (const s of sp.getAll('neq')) { const p = split(s); if (p) q = q.neq(p[0], p[1]) }
  for (const s of sp.getAll('gte')) { const p = split(s); if (p) q = q.gte(p[0], p[1]) }
  for (const s of sp.getAll('lte')) { const p = split(s); if (p) q = q.lte(p[0], p[1]) }
  for (const s of sp.getAll('gt'))  { const p = split(s); if (p) q = q.gt(p[0], p[1]) }
  for (const s of sp.getAll('lt'))  { const p = split(s); if (p) q = q.lt(p[0], p[1]) }
  for (const s of sp.getAll('in'))  { const p = split(s); if (p) q = q.in(p[0], p[1].split('|')) }
  for (const s of sp.getAll('ilike')) { const p = split(s); if (p) q = q.ilike(p[0], `%${p[1].replace(/[%,()]/g, ' ')}%`) }
  for (const s of sp.getAll('is'))  { const p = split(s); if (p) q = q.is(p[0], p[1] === 'null' ? null : p[1] === 'true') }

  // Çoklu sıralama: ord=alan:asc|desc (yeni) — eski order/order_asc parametresi de desteklenir
  const ords = sp.getAll('ord')
  if (ords.length) {
    for (const o of ords) { const p = split(o); if (p) q = q.order(p[0], { ascending: p[1] === 'asc' }) }
  } else if (sp.get('order') && FIELD.test(sp.get('order')!)) {
    q = q.order(sp.get('order')!, { ascending: sp.get('order_asc') === 'true' })
  }

  const limit = sp.get('limit') ? Math.min(+sp.get('limit')!, 1000) : null
  const offset = sp.get('offset') ? Math.max(+sp.get('offset')!, 0) : 0
  if (offset && limit) q = q.range(offset, offset + limit - 1)
  else if (limit) q = q.limit(limit)
  return q
}
