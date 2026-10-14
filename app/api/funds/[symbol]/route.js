import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol || "").toUpperCase();
  if (!/^[A-Z0-9-]{2,15}$/.test(symbol)) {
    return NextResponse.json({ error: "Mã quỹ không hợp lệ." }, { status: 400 });
  }

  // Try the public CafeF detail page. Parsing is deliberately conservative:
  // if a reliable NAV/change pair cannot be found, return a source link instead of a guess.
  const url = `https://cafef.vn/du-lieu/chung-chi-quy/${symbol.toLowerCase()}.chn`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TradingTools/1.0)", "Accept-Language": "vi-VN,vi;q=0.9" },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`CafeF trả HTTP ${res.status}`);
    const html = await res.text();
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ");
    const patterns = [
      /Giá gần nhất[\s\S]{0,220}?([0-9][0-9.,]*)\s*đ\s*([+\-−]?[0-9]+(?:[.,][0-9]+)?)\s*%/i,
      /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*đ\s*([+\-−]?[0-9]+(?:[.,][0-9]+)?)\s*%/i
    ];
    let match = null;
    for (const pattern of patterns) { match = text.match(pattern); if (match) break; }
    if (!match) throw new Error("Trang nguồn không có cặp NAV và % biến động nhận diện được.");
    const nav = Number(match[1].replace(/,/g, ""));
    const changePct = Number(match[2].replace(",", ".").replace("−", "-"));
    if (!Number.isFinite(nav) || !Number.isFinite(changePct) || nav <= 0) throw new Error("Dữ liệu NAV không hợp lệ.");
    const previousNav = nav / (1 + changePct / 100);
    return NextResponse.json({
      symbol, nav, changeAbs: nav - previousNav, changePct,
      date: "Theo dữ liệu CafeF", source: "CafeF", sourceUrl: url
    }, { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" } });
  } catch (error) {
    return NextResponse.json({
      error: `Không xác minh được NAV của ${symbol} từ CafeF: ${error.message}. Hãy mở Fmarket để xem dữ liệu mới nhất.`,
      sourceUrl: "https://fmarket.vn/danh-sach-quy",
      cafeFUrl: url
    }, { status: 502 });
  }
}
