import { NextResponse } from "next/server";
import { getProducts } from "@/lib/queries";
import { parseFilters } from "@/lib/parse-filters";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const obj: Record<string, string | string[]> = {};
  for (const key of searchParams.keys()) {
    const all = searchParams.getAll(key);
    obj[key] = all.length > 1 ? all : all[0];
  }
  const filters = parseFilters(obj, typeof obj.department === "string" ? obj.department : undefined);
  if (obj.perPage) filters.perPage = Number(obj.perPage);

  try {
    const result = await getProducts(filters);
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/products", e);
    return NextResponse.json({ products: [], total: 0, totalPages: 1 }, { status: 500 });
  }
}
