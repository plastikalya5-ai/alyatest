// Ortak istemci: /api/erp ve /api/muhasebe proxy'leri için supabase-benzeri sorgu API'si.
// Aynı filtre birden fazla kez zincirlenebilir (.eq().eq()), .in/.ilike/.neq/.gt/.lt/.is desteklenir.

type Filter = [string, string]

class Q {
  constructor(
    private ep: string,
    private base: Record<string, string>,
    private filters: Filter[] = [],
  ) {}
  private add(op: string, f: string, v: any) { return new Q(this.ep, this.base, [...this.filters, [op, `${f}:${v}`]]) }
  eq(f: string, v: any)    { return this.add('eq', f, v) }
  neq(f: string, v: any)   { return this.add('neq', f, v) }
  gte(f: string, v: any)   { return this.add('gte', f, v) }
  lte(f: string, v: any)   { return this.add('lte', f, v) }
  gt(f: string, v: any)    { return this.add('gt', f, v) }
  lt(f: string, v: any)    { return this.add('lt', f, v) }
  in(f: string, v: any[])  { return this.add('in', f, v.join('|')) }
  ilike(f: string, v: string) { return this.add('ilike', f, v) }
  is(f: string, v: null | boolean) { return this.add('is', f, v === null ? 'null' : String(v)) }
  order(f: string, o?: { ascending?: boolean }) { return this.add('ord', f, o?.ascending === true ? 'asc' : 'desc') }
  limit(n: number)         { return new Q(this.ep, { ...this.base, limit: String(n) }, this.filters) }
  range(from: number, to: number) { return new Q(this.ep, { ...this.base, offset: String(from), limit: String(to - from + 1) }, this.filters) }
  exec(): Promise<any> {
    const sp = new URLSearchParams(this.base)
    this.filters.forEach(([k, v]) => sp.append(k, v))
    return fetch(`${this.ep}?${sp}`).then(r => r.json())
  }
}

const METHODS = ['eq', 'neq', 'gte', 'lte', 'gt', 'lt', 'in', 'ilike', 'is', 'order', 'limit', 'range']
const wrap = (q: Q): any =>
  new Proxy(q, {
    get(t: any, prop: string) {
      if (prop === 'then')  return (fn: any, fe?: any) => t.exec().then(fn, fe)
      if (prop === 'catch') return (fe: any) => t.exec().catch(fe)
      if (METHODS.includes(prop)) return (...a: any[]) => wrap(t[prop](...a))
      return t[prop]?.bind?.(t) ?? t[prop]
    },
  })

export function makeClient(ep: string) {
  const post = (body: object) =>
    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

  return {
    from: (table: string) => ({
      select: (select = '*', opts?: any) => wrap(new Q(ep, { table, select, ...(opts?.count ? { count: 'true' } : {}) })),
      insert: (data: any) => post({ table, op: 'insert', data }),
      update: (data: any) => ({ eq: (_: string, id: any) => post({ table, op: 'update', data, id }) }),
      delete: () => ({ eq: (_: string, id: any) => post({ table, op: 'delete', id }) }),
      upsert: (data: any) => post({ table, op: 'upsert', data }),
    }),
    // 1000 satır sınırını aşan tablolar için sayfalayarak hepsini getirir (üst sınır: 20.000 satır)
    async all(table: string, select = '*', build?: (q: any) => any): Promise<any[]> {
      const out: any[] = []
      for (let off = 0; off < 20000; off += 1000) {
        let q: any = wrap(new Q(ep, { table, select }))
        if (build) q = build(q)
        const res = await q.range(off, off + 999)
        const rows = res?.data || []
        out.push(...rows)
        if (rows.length < 1000) break
      }
      return out
    },
  }
}
