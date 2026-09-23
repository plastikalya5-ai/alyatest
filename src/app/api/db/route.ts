import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getSb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}

export async function GET(req: NextRequest) {
  const p = Object.fromEntries(new URL(req.url).searchParams)
  const { table, select='*', order, order_asc, eq, gte, lte, limit, count } = p
  const sb = getSb()

  let q: any = sb.from(table).select(select, count==='true' ? {count:'exact',head:true} : undefined)
  if (eq)    { const [f,...rest]=eq.split(':');   q = q.eq(f, rest.join(':')) }
  if (gte)   { const [f,...rest]=gte.split(':');  q = q.gte(f, rest.join(':')) }
  if (lte)   { const [f,...rest]=lte.split(':');  q = q.lte(f, rest.join(':')) }
  if (order) q = q.order(order, {ascending: order_asc==='true'})
  if (limit) q = q.limit(+limit)

  const { data, error, count:cnt } = await q
  if (error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({data, count:cnt})
}

export async function POST(req: NextRequest) {
  const { table, op, data, id } = await req.json()
  const sb = getSb()
  let r: any
  if (op==='insert') r = await sb.from(table).insert(data)
  else if (op==='update') r = await sb.from(table).update(data).eq('id',id)
  else if (op==='delete') r = await sb.from(table).delete().eq('id',id)
  else if (op==='upsert') r = await sb.from(table).upsert(data)
  if (r?.error) return NextResponse.json({error:r.error.message},{status:500})
  return NextResponse.json({ok:true})
}
