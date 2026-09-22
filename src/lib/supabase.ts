import { createClient } from "@supabase/supabase-js";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(URL, ANON);

// ─── Types ──────────────────────────────────────────────
export type Product = {
  id: string;
  code: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  image_url: string;
  images: string[];
  specs: Record<string, string>;
  tags: string[];
  is_featured: boolean;
  is_new: boolean;
  sort_order: number;
  created_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

export type Settings = {
  company: string;
  founded: number;
  address: string;
  phone: string;
  whatsapp: string;
  export_phone: string;
  email: string;
  export_email: string;
  working_hours: string;
};

export type Stats = {
  years: number;
  countries: number;
  models: number;
  local_production: number;
};

// ─── Queries ─────────────────────────────────────────────
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order");
  return data ?? [];
}

export async function getAllProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getSettings(): Promise<Settings | null> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "site")
    .single();
  return data?.value ?? null;
}

export async function getStats(): Promise<Stats | null> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "stats")
    .single();
  return data?.value ?? null;
}

export async function getExportCountries(): Promise<string[]> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "export_countries")
    .single();
  return data?.value ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function submitContact(payload: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const { error } = await supabase
    .from("contact_submissions")
    .insert(payload);
  return { error };
}
