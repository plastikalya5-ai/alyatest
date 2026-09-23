import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}

export async function GET(req: NextRequest) {
  const p = Object.fromEntries(new URL(req.url).searchParams)
  const { table, select='*', order, order_asc='false', eq, gte, lte, limit, count } = p
  const sb = getSb()
  let q: any = sb.from(table).select(select, count==='true'?{count:'exact',head:true}:undefined)
  if (eq)    { const [f,...r]=eq.split(':');  q=q.eq(f,r.join(':')) }
  if (gte)   { const [f,...r]=gte.split(':'); q=q.gte(f,r.join(':')) }
  if (lte)   { const [f,...r]=lte.split(':'); q=q.lte(f,r.join(':')) }
  if (order) q=q.order(order,{ascending:order_asc==='true'})
  if (limit) q=q.limit(+limit)
  const { data, error, count:cnt } = await q
  if (error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({data,count:cnt})
}

export async function POST(req: NextRequest) {
  const { table, op, data, id, match } = await req.json()
  const sb = getSb()
  let r: any
  if (op==='insert') r=await sb.from(table).insert(data).select()
  else if (op==='update') r=await sb.from(table).update(data).eq('id',id).select()
  else if (op==='delete') r=await sb.from(table).delete().eq('id',id)
  else if (op==='upsert') r=await sb.from(table).upsert(data).select()
  if (r?.error) return NextResponse.json({error:r.error.message},{status:500})
  return NextResponse.json({ok:true,data:r?.data})
}
